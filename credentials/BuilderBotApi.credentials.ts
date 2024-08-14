import {
    IAuthenticateGeneric,
    ICredentialType,
    INodeProperties,
} from 'n8n-workflow';

export class BuilderBotApi implements ICredentialType {
    name = 'builderBotApi';
    displayName = 'BuilderBot API';
    documentationUrl = 'https://www.builderbot.cloud/docs';
    properties: INodeProperties[] = [
        {
            displayName: 'API Key',
            name: 'apiKey',
            type: 'string',
            default: '',
            typeOptions: {
                password: true,
            },
            required: true,
        },
    ];

    authenticate: IAuthenticateGeneric = {
        type: 'generic',
        properties: {
            headers: {
                'x-api-builderbot': '={{$credentials.apiKey}}',
            },
        },
    };
}