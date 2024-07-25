import { CompanionVariableDefinition } from '@companion-module/base'
import type { MediaLiveInstance } from './main.js'

// TODO: Update variables (and amount of variables) based on channels returned from AWS?
//		 (So one variable per channel)

function generateChannelVariables(self: MediaLiveInstance): CompanionVariableDefinition[] {
	// If no channels are available, return an empty array
	if (self.channels.length === 0) {
		//self.log('warn', 'No channels available, not generating variables')
		return []
	}

	const variables: CompanionVariableDefinition[] = []

	self.channels.map((channel) => {
		variables.push(
			{
				variableId: `channel_${channel.id}_name`,
				name: `Channel ${channel.name} - Name`,
			},
			{
				// Use the actual unique ID here, since the channel name might not be unique
				variableId: `channel_${channel.id}_state`,
				name: `Channel ${channel.name} - State`,
			}
		)
	})

	return variables
}

export function UpdateVariableDefinitions(self: MediaLiveInstance): void {
	self.setVariableDefinitions(generateChannelVariables(self))
}
