import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { ExpenseQueryDto } from './dto/expense-query.dto';
import { CreateSettlementDto } from './dto/create-settlement.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('api/expenses')
@UseGuards(JwtAuthGuard)
export class ExpensesController {
  constructor(private expensesService: ExpensesService) {}

  @Post()
  create(@Body() dto: CreateExpenseDto, @Request() req) {
    return this.expensesService.create(dto, req.user.id);
  }

  @Get()
  findAll(@Request() req, @Query() query: ExpenseQueryDto) {
    return this.expensesService.findAll(req.user.id, query.category);
  }

  @Get('balances')
  getBalances(@Request() req) {
    return this.expensesService.getBalances(req.user.id);
  }

  @Post('settlements')
  createSettlement(@Body() dto: CreateSettlementDto, @Request() req) {
    return this.expensesService.createSettlement(dto, req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.expensesService.findOne(id, req.user.id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateExpenseDto,
    @Request() req,
  ) {
    return this.expensesService.update(id, dto, req.user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.expensesService.remove(id, req.user.id);
  }
}
