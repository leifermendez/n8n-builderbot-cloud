import { IExecuteFunctions } from 'n8n-core';
import {
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
} from 'n8n-workflow';

export class BuilderBot implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'BuilderBot.cloud',
    name: 'builderBot',
    icon: 'file:builderbot.svg',
    group: ['output'],
    version: 1,
    description: 'Sends a message using BuilderBot API',
    defaults: {
      name: 'BuilderBot',
    },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [
      {
        name: 'builderBotApi',
        required: true,
      },
    ],
    properties: [
      {
        displayName: 'Project ID',
        name: 'projectId',
        type: 'string',
        default: '',
        placeholder: 'Enter your BuilderBot Project ID',
        description: 'The Project ID for your BuilderBot project',
        required: true,
      },
      {
        displayName: 'Message Content',
        name: 'content',
        type: 'string',
        default: '',
        placeholder: 'Enter your message here',
        description: 'The content of the message to be sent',
        required: true,
      },
      {
        displayName: 'Phone Number',
        name: 'number',
        type: 'string',
        default: '',
        placeholder: 'Enter the phone number',
        description: 'The phone number to send the message to',
        required: true,
      },
      {
        displayName: 'Media URL',
        name: 'media',
        type: 'string',
        default: '',
        placeholder: 'https://builderbot.vercel.app/assets/thumbnail-vector.png',
        description: 'The URL of the media file to be sent (optional)',
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const URL = 'https://www.builderbot.cloud/api/v2/';
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];

    // Get the credentials
    const credentials = await this.getCredentials('builderBotApi');

    // Verificar si la API key está presente
    if (!credentials.apiKey) {
      throw new Error('API key is missing. Please check your BuilderBot API credentials.');
    }

    for (let i = 0; i < items.length; i++) {
      const projectId = this.getNodeParameter('projectId', i) as string;
      const content = this.getNodeParameter('content', i) as string;
      const number = this.getNodeParameter('number', i) as string;
      const mediaUrl = this.getNodeParameter('media', i, '') as string;

      const body = {
        messages: {
          content,
          mediaUrl: mediaUrl.length > 0 ? mediaUrl : undefined,
        },
        number,
      };

      try {
        const response = await this.helpers.request({
          method: 'POST',
          url: `${URL}${projectId}/messages`,
          body,
          headers: {
            'x-api-builderbot': credentials.apiKey as string,
          },
          json: true,
        });

        // Verificar si la respuesta indica un error de autenticación
        if (response.error && response.error.includes('authentication')) {
          throw new Error('Authentication failed. Please check your API key.');
        }

        returnData.push({ json: response });
      } catch (error) {
        if (this.continueOnFail()) {
          returnData.push({ json: { error: error.message } });
        } else {
          throw error;
        }
      }
    }

    return [returnData];
  }
}