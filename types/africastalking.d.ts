declare module "africastalking" {
  type AfricaTalkingConfig = {
    username: string;
    apiKey: string;
  };

  type SmsSendOptions = {
    to: string[];
    message: string;
    from?: string;
  };

  type SmsRecipient = {
    status?: string;
    statusCode?: number | string;
    number?: string;
    messageId?: string;
  };

  type SmsSendResponse = {
    SMSMessageData?: {
      Message?: string;
      Recipients?: SmsRecipient[];
    };
  };

  type AfricaTalkingClient = {
    SMS: {
      send(options: SmsSendOptions): Promise<SmsSendResponse>;
    };
  };

  export default function africastalking(config: AfricaTalkingConfig): AfricaTalkingClient;
}
