import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from "@nestjs/common";

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const request = ctx.getRequest();
        const response = ctx.getResponse();

        let status = 500;
        let message = "خطای مهمی رخ داده. با پشتیبانی تماس بگیرید";

        if (exception instanceof HttpException) {
            status = exception.getStatus();
            const exceptionResponse: any = exception.getResponse();
            message = exceptionResponse.message || exceptionResponse;
        } else if (exception instanceof Error) {
            message = exception.message;
        }

        response.status(status).json({
            success: false,
            statusCode: status,
            message,
            timestamp: new Date().toISOString(),
            path: request.url,
        });
    }
}