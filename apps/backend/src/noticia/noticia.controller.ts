import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { ZodResponse } from 'nestjs-zod';
import { NoticiaService } from './noticia.service';
import { CreateNoticiaDto } from './schemas/create-noticia.schema';
import { UpdateNoticiaDto } from './schemas/update-noticia.schema';
import { NoticiaResponseDto } from './schemas/noticia-response.schema';

@ApiTags('Noticias')
@Controller('noticias')
export class NoticiaController {
  constructor(private readonly noticiaService: NoticiaService) {}

  @Post()
  @ApiOperation({ summary: 'Cria uma notícia' })
  @ZodResponse({ status: HttpStatus.CREATED, type: NoticiaResponseDto })
  criar(@Body() dto: CreateNoticiaDto) {
    return this.noticiaService.criar(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lista todas as notícias' })
  @ApiOkResponse({ type: [NoticiaResponseDto] })
  listarTodas() {
    return this.noticiaService.listarTodas();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca uma notícia pelo id' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ type: NoticiaResponseDto })
  buscarPorId(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.noticiaService.buscarPorId(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualiza uma notícia' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ZodResponse({ status: HttpStatus.OK, type: NoticiaResponseDto })
  atualizar(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateNoticiaDto,
  ) {
    return this.noticiaService.atualizar(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove uma notícia' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiNoContentResponse()
  @HttpCode(HttpStatus.NO_CONTENT)
  async remover(@Param('id', new ParseUUIDPipe()) id: string) {
    await this.noticiaService.remover(id);
  }
}
