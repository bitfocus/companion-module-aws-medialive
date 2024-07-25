import { combineRgb } from '@companion-module/base'
import type { MediaLiveInstance } from './main.js'

export function UpdateFeedbacks(self: MediaLiveInstance): void {
	// Possible states are 'IDLE', 'RUNNING', 'STARTING', 'STOPPING'
	self.setFeedbackDefinitions({
		ChannelState: {
			name: 'Channel state',
			type: 'advanced',
			options: [
				{
					id: 'bgColorIdle',
					type: 'colorpicker',
					label: 'Background color when idle',
					default: combineRgb(0, 0, 0),
					returnType: 'number',
				},
				{
					id: 'bgColorStarting',
					type: 'colorpicker',
					label: 'Background color when starting',
					default: combineRgb(255, 128, 128),
					returnType: 'number',
				},
				{
					id: 'bgColorRunning',
					type: 'colorpicker',
					label: 'Background color when running',
					default: combineRgb(255, 0, 0),
					returnType: 'number',
				},
				{
					id: 'bgColorStopping',
					type: 'colorpicker',
					label: 'Background color when stopping',
					default: combineRgb(255, 191, 128),
					returnType: 'number',
				},
				{
					id: 'channelName',
					type: 'dropdown',
					label: 'Channel name',
					choices: self.channels.map((channel) => {
						return { id: channel.id, label: channel.name }
					}),
					default: '',
				},
			],
			callback: (feedback) => {
				switch (self.channels.find((channel) => channel.id === feedback.options.channelName)?.state) {
					case 'IDLE':
						return { bgcolor: feedback.options.bgColorIdle as number }
					case 'RUNNING':
						return { bgcolor: feedback.options.bgColorRunning as number }
					case 'STARTING':
						return { bgcolor: feedback.options.bgColorStarting as number }
					case 'STOPPING':
						return { bgcolor: feedback.options.bgColorStopping as number }
					default:
						// Or just return the idle color?
						return { bgcolor: combineRgb(0, 0, 0) }
				}
			},
		},
	})
}
