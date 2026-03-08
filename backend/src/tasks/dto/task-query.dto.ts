import { IsOptional, IsEnum } from 'class-validator';
import { TaskStatus } from '../../generated/prisma/enums';

export class TaskQueryDto {
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;
}
