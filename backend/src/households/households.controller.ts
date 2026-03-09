import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { HouseholdsService } from './households.service';
import { CreateHouseholdDto } from './dto/create-household.dto';
import { UpdateHouseholdDto } from './dto/update-household.dto';
import { JoinHouseholdDto } from './dto/join-household.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('api/households')
@UseGuards(JwtAuthGuard)
export class HouseholdsController {
  constructor(private householdsService: HouseholdsService) {}

  @Post()
  create(@Body() dto: CreateHouseholdDto, @Request() req) {
    return this.householdsService.create(dto, req.user.id);
  }

  @Post('join')
  join(@Body() dto: JoinHouseholdDto, @Request() req) {
    return this.householdsService.join(dto, req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.householdsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateHouseholdDto,
    @Request() req,
  ) {
    return this.householdsService.update(id, dto, req.user.id);
  }

  @Delete(':id/members/:memberId')
  removeMember(
    @Param('id') id: string,
    @Param('memberId') memberId: string,
    @Request() req,
  ) {
    return this.householdsService.removeMember(id, memberId, req.user.id);
  }

  @Patch(':id/transfer-admin/:memberId')
  transferAdmin(
    @Param('id') id: string,
    @Param('memberId') memberId: string,
    @Request() req,
  ) {
    return this.householdsService.transferAdmin(id, memberId, req.user.id);
  }
}
