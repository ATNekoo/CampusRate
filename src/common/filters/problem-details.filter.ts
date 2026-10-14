import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ProblemDetails } from '../dtos/problem-details.dto';

@Catch()
export class ProblemDetailsFilter implements ExceptionFilter {
  private static isDuplicateKey(error: unknown): boolean {
    return (
      typeof error === 'object' &&
      error !== null &&
      (error as { code?: number }).code === 11000
    );
  }

  private static isDatabaseUnavailable(error: unknown): boolean {
    return (
      error instanceof Error &&
      [
        'MongooseServerSelectionError',
        'MongoServerSelectionError',
        'MongoNetworkError',
      ].includes(error.name)
    );
  }

  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const request = context.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let title = 'Unexpected error';
    let detail = 'An unexpected error occurred while processing the request.';
    let type = 'https://campusrate.example/errors/internal-error';
    let errors: string[] | undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const body = exception.getResponse();
      title = this.titleForStatus(status);
      type = this.typeForStatus(status);

      if (typeof body === 'string') {
        detail = body;
      } else if (typeof body === 'object' && body !== null) {
        const message = (body as Record<string, unknown>).message;
        if (Array.isArray(message)) {
          errors = message as string[];
          detail = 'The request contains invalid data.';
        } else if (typeof message === 'string') {
          detail = message;
        }
      }
    } else if (ProblemDetailsFilter.isDuplicateKey(exception)) {
      status = HttpStatus.CONFLICT;
      title = 'Conflict with current state';
      type = 'https://campusrate.example/errors/conflict';
      detail = 'A resource with the same unique value already exists.';
    } else if (ProblemDetailsFilter.isDatabaseUnavailable(exception)) {
      status = HttpStatus.SERVICE_UNAVAILABLE;
      title = 'Service unavailable';
      type = 'https://campusrate.example/errors/service-unavailable';
      detail =
        'The service is temporarily unavailable. Please try again later.';
    }

    const problem: ProblemDetails = {
      type,
      title,
      status,
      detail,
      instance: request.originalUrl,
      ...(errors ? { errors } : {}),
    };

    response
      .status(status)
      .contentType('application/problem+json')
      .json(problem);
  }

  private titleForStatus(status: number): string {
    switch (status) {
      case HttpStatus.BAD_REQUEST:
        return 'Validation failed';
      case HttpStatus.NOT_FOUND:
        return 'Resource not found';
      case HttpStatus.CONFLICT:
        return 'Conflict with current state';
      default:
        return 'Unexpected error';
    }
  }

  private typeForStatus(status: number): string {
    switch (status) {
      case HttpStatus.BAD_REQUEST:
        return 'https://campusrate.example/errors/validation-failed';
      case HttpStatus.NOT_FOUND:
        return 'https://campusrate.example/errors/not-found';
      case HttpStatus.CONFLICT:
        return 'https://campusrate.example/errors/conflict';
      default:
        return 'https://campusrate.example/errors/internal-error';
    }
  }
}
