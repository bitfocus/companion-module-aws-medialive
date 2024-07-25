import {
	InstanceBase,
	runEntrypoint,
	InstanceStatus,
	SomeCompanionConfigField,
	CompanionVariableValues,
} from '@companion-module/base'
import { GetConfigFields, type ModuleConfig } from './config.js'
import { UpdateVariableDefinitions } from './variables.js'
import { UpgradeScripts } from './upgrades.js'
import { UpdateActions } from './actions.js'
import { UpdateFeedbacks } from './feedbacks.js'

import { MediaLiveClient, ListChannelsCommand, ChannelSummary } from '@aws-sdk/client-medialive'
import { setIntervalAsync, clearIntervalAsync, SetIntervalAsyncTimer } from 'set-interval-async'

export interface MediaLiveChannel {
	id: string
	name: string
	state: string
}

export class MediaLiveInstance extends InstanceBase<ModuleConfig> {
	config!: ModuleConfig // Setup in init()
	awsClient: MediaLiveClient = new MediaLiveClient()
	channels: MediaLiveChannel[] = []
	poll: SetIntervalAsyncTimer<[]> | null = null

	constructor(internal: unknown) {
		super(internal)
	}

	async init(config: ModuleConfig): Promise<void> {
		this.config = config

		this.updateStatus(InstanceStatus.Connecting)

		await this.initConnection()

		this.updateActions() // export actions
		this.updateFeedbacks() // export feedbacks
		this.updateVariableDefinitions() // export variable definitions
	}
	// When module gets deleted
	async destroy(): Promise<void> {
		await this.stopPolling()
		this.awsClient.destroy()
		this.log('debug', 'AWS MediaLive module destroyed')
	}

	async configUpdated(config: ModuleConfig): Promise<void> {
		this.config = config
		// Reconnect with new config
		this.log('info', 'Reconnecting to AWS MediaLive with new config')
		await this.stopPolling()
		if (this.awsClient) {
			this.awsClient.destroy()
		}
		await this.initConnection()
	}

	// Return config fields for web config
	getConfigFields(): SomeCompanionConfigField[] {
		return GetConfigFields()
	}

	updateActions(): void {
		UpdateActions(this)
	}

	updateFeedbacks(): void {
		UpdateFeedbacks(this)
	}

	updateVariableDefinitions(): void {
		UpdateVariableDefinitions(this)
	}

	async initConnection(): Promise<void> {
		// Send initial data requests, then start polling (5s interval)
		this.log('info', 'Connecting to AWS MediaLive')

		try {
			this.awsClient = new MediaLiveClient({
				region: this.config.region,
				credentials: { accessKeyId: this.config.awsId, secretAccessKey: this.config.awsSecret },
				// logger: {
				// 	debug: (message) => {
				// 		this.log('debug', message)
				// 	},
				// 	info: (message) => {
				// 		this.log('info', message)
				// 	},
				// 	warn: (message) => {
				// 		this.log('warn', message)
				// 	},
				// 	error: (message) => {
				// 		this.log('error', message)
				// 	},
				// },
			})
		} catch (e) {
			this.log('error', `Error connecting to AWS: ${e}`)
			this.updateStatus(InstanceStatus.ConnectionFailure)
			return
		}

		// Immediately run poll status, since MediaLiveClient doesn't throw an error on invalid credentials ¯\_(ツ)_/¯
		await this.pollStatus()
			.then(async () => {
				this.log('info', 'Successfully connected to AWS MediaLive')
				this.updateStatus(InstanceStatus.Ok)
				// Warn the user if no channels were found on startup
				if (this.channels.length === 0) {
					this.log('warn', 'No channels found. Is this the right region?')
					this.updateStatus(InstanceStatus.BadConfig, 'No channels found. Is this the right region?')
				}
				// Start polling every 5s
				await this.startPolling()
			})
			.catch((e) => {
				this.log('error', `Failed to connect to AWS MediaLive: ${e}`)
				this.updateStatus(InstanceStatus.ConnectionFailure)
			})
	}

	async startPolling(): Promise<void> {
		// Setup polling interval (5s)
		await this.stopPolling()

		this.poll = setIntervalAsync(async () => {
			await this.pollStatus().catch((e) => {
				this.log('error', `Error getting channel status: ${e}`)
				this.updateStatus(InstanceStatus.ConnectionFailure)
			})
		}, 5000)
	}

	async stopPolling(): Promise<void> {
		if (this.poll) {
			await clearIntervalAsync(this.poll)
			this.poll = null
		}
	}

	async pollStatus(): Promise<void> {
		// Get channel status
		await this.awsClient.send(new ListChannelsCommand({})).then((response) => {
			// this.log('debug', `ListChannelsCommand response: ${JSON.stringify(response)}`)
			// Populate channels array
			this.populateChannels(response.Channels || [])

			// Update actions and feedbacks for new channels
			// ? Don't know if updating actions every 5 seconds is the best way to do this
			this.updateActions()
			this.updateFeedbacks()
			this.updateVariableDefinitions()

			// Actually update the variables and feedback states (not just the labels)
			this.setVariableValues(this.getVariableValues())
			this.checkFeedbacks('ChannelState')
		})
	}

	populateChannels(channels: ChannelSummary[]): void {
		// Reset and repopulate channels array
		this.channels = []

		if (channels.length === 0) {
			this.log('debug', 'No channels available to populate')
			return
		}

		channels.forEach((channel) => {
			// Strip ChannelSummary down to only what we need
			this.channels.push({ id: channel.Id || '', name: channel.Name || '', state: channel.State || '' })
		})

		this.log('debug', `Populated channels: ${JSON.stringify(this.channels)}`)
		// Update status to OK if channels are found (in the case they were added in AWS after startup)
		this.updateStatus(InstanceStatus.Ok)
	}

	getVariableValues(): CompanionVariableValues {
		const values: CompanionVariableValues = {}

		if (this.channels.length === 0) {
			return values
		}

		this.channels.forEach((channel) => {
			values[`channel_${channel.id}_state`] = channel.state
			values[`channel_${channel.id}_name`] = channel.name
		})
		// this.log('debug', `Variable values: ${JSON.stringify(values)}`)
		return values
	}
}

runEntrypoint(MediaLiveInstance, UpgradeScripts)
