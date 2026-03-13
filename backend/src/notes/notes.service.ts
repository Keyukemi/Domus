import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';

@Injectable()
export class NotesService {
  constructor(private prisma: PrismaService) {}

  private readonly noteInclude = {
    author: { select: { id: true, name: true, email: true } },
  };

  private async getUserWithHousehold(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user || !user.householdId) {
      throw new ForbiddenException('You must belong to a household');
    }

    return user;
  }

  async create(dto: CreateNoteDto, userId: string) {
    const user = await this.getUserWithHousehold(userId);

    return this.prisma.note.create({
      data: {
        content: dto.content,
        authorId: userId,
        householdId: user.householdId!,
      },
      include: this.noteInclude,
    });
  }

  async findAll(userId: string) {
    const user = await this.getUserWithHousehold(userId);

    return this.prisma.note.findMany({
      where: { householdId: user.householdId! },
      include: this.noteInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    const user = await this.getUserWithHousehold(userId);

    const note = await this.prisma.note.findUnique({
      where: { id },
      include: this.noteInclude,
    });

    if (!note) {
      throw new NotFoundException('Note not found');
    }

    if (note.householdId !== user.householdId) {
      throw new ForbiddenException('Note does not belong to your household');
    }

    return note;
  }

  async update(id: string, dto: UpdateNoteDto, userId: string) {
    const note = await this.findOne(id, userId);

    if (note.authorId !== userId) {
      throw new ForbiddenException('Only the author can edit this note');
    }

    return this.prisma.note.update({
      where: { id },
      data: { content: dto.content },
      include: this.noteInclude,
    });
  }

  async remove(id: string, userId: string) {
    const note = await this.findOne(id, userId);

    if (note.authorId !== userId) {
      throw new ForbiddenException('Only the author can delete this note');
    }

    await this.prisma.note.delete({ where: { id } });

    return { message: 'Note deleted successfully' };
  }
}
