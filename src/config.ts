import { type SomeCompanionConfigField } from '@companion-module/base'

export interface ModuleConfig {
	awsId: string
	awsSecret: string
	region: string
}

export function GetConfigFields(): SomeCompanionConfigField[] {
	return [
		{
			type: 'dropdown',
			id: 'region',
			label: 'AWS Region',
			default: 'eu-north-1',
			width: 5,
			choices: [
				// There are multiple regions that cant connect, but I'll leave them just in case they suddenly start working
				{ id: 'us-east-1', label: 'US East (N. Virginia)' },
				{ id: 'us-east-2', label: 'US East (Ohio)' },
				{ id: 'us-west-1', label: 'US West (N. California)' },
				{ id: 'us-west-2', label: 'US West (Oregon)' },
				{ id: 'af-south-1', label: 'Africa (Cape Town)' },
				{ id: 'ap-east-1', label: 'Asia Pacific (Hong Kong)' },
				{ id: 'ap-south-2', label: 'Asia Pacific (Hyderabad)' },
				{ id: 'ap-southeast-3', label: 'Asia Pacific (Jakarta)' },
				{ id: 'ap-southeast-4', label: 'Asia Pacific (Melbourne)' },
				{ id: 'ap-south-1', label: 'Asia Pacific (Mumbai)' },
				{ id: 'ap-northeast-3', label: 'Asia Pacific (Osaka)' },
				{ id: 'ap-northeast-2', label: 'Asia Pacific (Seoul)' },
				{ id: 'ap-southeast-1', label: 'Asia Pacific (Singapore)' },
				{ id: 'ap-southeast-2', label: 'Asia Pacific (Sydney)' },
				{ id: 'ap-northeast-1', label: 'Asia Pacific (Tokyo)' },
				{ id: 'ca-central-1', label: 'Canada (Central)' },
				{ id: 'ca-west-1', label: 'Canada West (Calgary)' },
				{ id: 'eu-central-1', label: 'Europe (Frankfurt)' },
				{ id: 'eu-west-1', label: 'Europe (Ireland)' },
				{ id: 'eu-west-2', label: 'Europe (London)' },
				{ id: 'eu-south-1', label: 'Europe (Milan)' },
				{ id: 'eu-west-3', label: 'Europe (Paris)' },
				{ id: 'eu-south-2', label: 'Europe (Spain)' },
				{ id: 'eu-north-1', label: 'Europe (Stockholm)' },
				{ id: 'eu-central-2', label: 'Europe (Zurich)' },
				{ id: 'il-central-1', label: 'Israel (Tel Aviv)' },
				{ id: 'me-south-1', label: 'Middle East (Bahrain)' },
				{ id: 'me-central-1', label: 'Middle East (UAE)' },
				{ id: 'sa-east-1', label: 'South America (São Paulo)' },
				{ id: 'us-gov-east-1', label: 'AWS GovCloud (US-East)' },
				{ id: 'us-gov-west-1', label: 'AWS GovCloud (US-West)' },
			],
		},
		{
			type: 'static-text',
			id: 'warning',
			label: 'LIMIT YOUR AWS ACCESS TO THE BARE MINIMUM REQUIRED',
			value: 'See the Readme for permissions needed',
			width: 8,
		},
		{
			type: 'textinput',
			id: 'awsId',
			label: 'AWS Access Key ID',
			width: 12,
			//regex: Regex.IP,
			required: true,
		},
		{
			type: 'textinput',
			id: 'awsSecret',
			label: 'AWS Access Key Secret',
			width: 12,
			required: true,
		},
	]
}
