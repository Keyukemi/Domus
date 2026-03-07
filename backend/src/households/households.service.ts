import { Injectable, ForbiddenException, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateHouseholdDto } from './dto/create-household.dto';
import { UpdateHouseholdDto } from './dto/update-household.dto';
import { JoinHouseholdDto } from './dto/join-household.dto';
import { randomBytes } from 'crypto';

@Injectable()
export class HouseholdsService {
  constructor(private prisma: PrismaService) {}

  private generateInviteCode(): string {
    return randomBytes(4).toString('hex').toUpperCase();
  }

  async create(dto: CreateHouseholdDto, userId: string) {
    // Check if user already belongs to a household
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (user?.householdId) {
      throw new ConflictException('You already belong to a household');
    }

    // Create household and update user in a transaction
    const household = await this.prisma.$transaction(async (tx) => {
      const household = await tx.household.create({
        data: {
          name: dto.name,
          inviteCode: this.generateInviteCode(),
        },
      });

      // Set the creator as ADMIN and link them to the household
      await tx.user.update({
        where: { id: userId },
        data: {
          householdId: household.id,
          role: 'ADMIN',
        },
      });

      return household;
    });

    return this.findOne(household.id);
  }

  async findOne(id: string) {
    const household = await this.prisma.household.findUnique({
      where: { id },
      include: {
        members: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
          },
        },
      },
    });

    if (!household) {
      throw new NotFoundException('Household not found');
    }

    return household;
  }

  async join(dto: JoinHouseholdDto, userId: string) {
    // Check if user already belongs to a household
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (user?.householdId) {
      throw new ConflictException('You already belong to a household');
    }

    // Find the household by invite code
    const household = await this.prisma.household.findUnique({
      where: { inviteCode: dto.inviteCode },
    });

    if (!household) {
      throw new NotFoundException('Invalid invite code');
    }

    // Add user to the household as a MEMBER
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        householdId: household.id,
        role: 'MEMBER',
      },
    });

    return this.findOne(household.id);
  }

  async update(id: string, dto: UpdateHouseholdDto, userId: string) {
    // Verify the user is an admin of this household
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user || user.householdId !== id) {
      throw new ForbiddenException('You do not belong to this household');
    }

    if (user.role !== 'ADMIN') {
      throw new ForbiddenException('Only admins can update household details');
    }

    await this.prisma.household.update({
      where: { id },
      data: { name: dto.name },
    });

    return this.findOne(id);
  }

  async removeMember(householdId: string, memberId: string, userId: string) {
    // Verify the requesting user is an admin of this household
    const admin = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!admin || admin.householdId !== householdId || admin.role !== 'ADMIN') {
      throw new ForbiddenException('Only admins can remove members');
    }

    // Prevent admin from removing themselves
    if (memberId === userId) {
      throw new ForbiddenException('Admins cannot remove themselves. Transfer admin role first.');
    }

    // Verify the target member belongs to this household
    const member = await this.prisma.user.findUnique({ where: { id: memberId } });

    if (!member || member.householdId !== householdId) {
      throw new NotFoundException('Member not found in this household');
    }

    // Remove member from household
    await this.prisma.user.update({
      where: { id: memberId },
      data: {
        householdId: null,
        role: 'MEMBER',
      },
    });

    return this.findOne(householdId);
  }

  async transferAdmin(householdId: string, memberId: string, userId: string) {
    // Verify the requesting user is the current admin
    const admin = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!admin || admin.householdId !== householdId || admin.role !== 'ADMIN') {
      throw new ForbiddenException('Only admins can transfer the admin role');
    }

    // Verify the target member belongs to this household
    const member = await this.prisma.user.findUnique({ where: { id: memberId } });

    if (!member || member.householdId !== householdId) {
      throw new NotFoundException('Member not found in this household');
    }

    // Swap roles in a transaction
    await this.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: { role: 'MEMBER' },
      });

      await tx.user.update({
        where: { id: memberId },
        data: { role: 'ADMIN' },
      });
    });

    return this.findOne(householdId);
  }
}
