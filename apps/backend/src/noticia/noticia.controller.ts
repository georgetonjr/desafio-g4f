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
  Query,
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
import { ListarNoticiasQueryDto } from './schemas/listar-noticias-query.schema';
import { NoticiaPaginadaResponseDto } from './schemas/noticia-paginada-response.schema';

@ApiTags('Noticias')
@Controller('noticias')
export class NoticiaController {
  constructor(private readonly noticiaService: NoticiaService) {}

  @Post()
  @ApiOperation({ summary: 'Cria uma notícia' })
  @ZodResponse({ status: HttpStatus.CREATED, type: NoticiaResponseDto })
  async criar(@Body() dto: CreateNoticiaDto) {
    return this.noticiaService.criar(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lista notícias com paginação e filtro' })
  @ZodResponse({ status: HttpStatus.OK, type: NoticiaPaginadaResponseDto })
  listar(@Query() query: ListarNoticiasQueryDto) {
    return this.noticiaService.listar(query);
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
  async atualizar(
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
