import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';
import { Request } from 'express';

export function IsFile(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isFile',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const request = args.object as Request;
          const file = request.files?.[propertyName] || request.file;

          // Check if the file is present
          if (!file) {
            return false;
          }

          // Additional file validation can be added here
          // Example: Check file type or size
          if (Array.isArray(file)) {
            // If multiple files are uploaded under the same field
            for (const f of file) {
              if (f.mimetype !== 'application/pdf') {
                return false;
              }
            }
          } else if (file.mimetype !== 'application/pdf') {
            // If a single file is uploaded
            return false;
          }

          return true;
        },
      },
    });
  };
}
