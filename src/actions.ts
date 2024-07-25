import { StartChannelCommand, StopChannelCommand } from '@aws-sdk/client-medialive'
import type { MediaLiveInstance, MediaLiveChannel } from './main.js'
import { DropdownChoice } from '@companion-module/base'

function createDropdownChoices(channels: MediaLiveChannel[]): DropdownChoice[] {
	if (channels.length === 0) {
		return []
	}
	return channels.map((channel) => {
		return { id: channel.id, label: channel.name }
	})
}

export function UpdateActions(self: MediaLiveInstance): void {
	const dropdownChoices = createDropdownChoices(self.channels)

	self.setActionDefinitions({
		startChannel: {
			name: 'Start channel',
			options: [
				{
					id: 'channelName',
					type: 'dropdown',
					label: 'Channel',
					choices: dropdownChoices,
					default: '',
				},
			],
			callback: async (event) => {
				self.log('debug', `Starting channel ID: ${event.options.channelName}`)

				const channel = self.channels.find((channel) => channel.id === event.options.channelName)

				if (!channel) {
					self.log('warn', `Failed to start. Channel ID not found: ${event.options.channelName}`)
					return
				}

				await self.awsClient
					.send(new StartChannelCommand({ ChannelId: event.options.channelName?.toString() }))
					.catch((e) => {
						self.log('error', `Failed to start channel: ${e}`)
					})
			},
		},
		stopChannel: {
			name: 'Stop channel',
			options: [
				{
					id: 'channelName',
					type: 'dropdown',
					label: 'Channel',
					choices: dropdownChoices,
					default: '',
				},
			],
			callback: async (event) => {
				self.log('debug', `Stopping channel ID: ${event.options.channelName}`)

				const channel = self.channels.find((channel) => channel.id === event.options.channelName)

				if (!channel) {
					self.log('warn', `Failed to stop. Channel ID not found: ${event.options.channelName}`)
					return
				}

				await self.awsClient.send(new StopChannelCommand({ ChannelId: channel.id })).catch((e) => {
					self.log('error', `Failed to start channel: ${e}`)
				})
			},
		},
		toggleChannel: {
			name: 'Toggle channel',
			options: [
				{
					id: 'channelName',
					type: 'dropdown',
					label: 'Channel',
					choices: dropdownChoices,
					default: '',
				},
			],
			callback: async (event) => {
				const channel = self.channels.find((channel) => channel.id === event.options.channelName)

				if (!channel) {
					self.log('warn', `Failed to toggle. Channel ID not found: ${event.options.channelName}`)
					return
				}

				if (channel.state === 'IDLE' || channel.state === 'STOPPING') {
					// Start channel as it's currently idle or stopping
					self.log('debug', `Starting channel ID: ${channel.id}`)

					await self.awsClient.send(new StartChannelCommand({ ChannelId: channel.id })).catch((e) => {
						self.log('error', `Failed to start channel: ${e}`)
					})
				} else {
					// Stop channel as it's currently running or starting
					self.log('debug', `Stopping channel ID: ${channel.id}`)

					await self.awsClient.send(new StopChannelCommand({ ChannelId: channel.id })).catch((e) => {
						self.log('error', `Failed to stop channel: ${e}`)
					})
				}
			},
		},
	})
}
