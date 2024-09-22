import { BadRequestException, Delete, Get, Injectable, InternalServerErrorException, Logger, NotFoundException, Patch, Post } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';
import { ErrorHandleService } from 'src/common/services/error-handle/error-handle.service';
import { PaginationDto } from '../common/dtos/pagination.dto';
import { validate as isUUID } from 'uuid';

@Injectable()
export class ProductsService {

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly errorHandler: ErrorHandleService,
  ) { }

  async create(createProductDto: CreateProductDto) {
    try {
      // Create a new product
      const product = this.productRepository.create(createProductDto);
      // Save the product to the database
      await this.productRepository.save(product);
      // Return the product
      return product;
    } catch (error) {
      this.errorHandler.errorHandle(error);
    }
  }

  findAll(PaginationDto: PaginationDto) {
    try {
      const { limit = 10, offset = 0 } = PaginationDto;
      // Find all products
      const products = this.productRepository.find(
        {
          take: limit,
          skip: offset,
        }
      );
      return products;
    } catch (error) {
      this.errorHandler.errorHandle(error);
    }
  }

  async findOne(term: string) {
    try {
      let product: Product;
      if (isUUID(term)) {
        product = await this.productRepository.findOneBy({ id: term });
      } else {
        // Busca el producto por el título o el slug mediante queryBuilder
        const queryBuilder = this.productRepository.createQueryBuilder();
        product = await queryBuilder
          .where('UPPER(title) =:title or slug =:slug', {
            title: term.toUpperCase(),
            slug: term.toLowerCase(),
          }).getOne();
      }
      // Verifica si se encontró el producto, si no, lanza una excepción
      if (!product) {
        throw new NotFoundException(`Product with ${term} not found`);
      }
      return product;
    } catch (error) {
      this.errorHandler.errorHandle(error);
    }
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    try {
      // Actualiza el producto con el ID dado
      const product = await this.productRepository.preload({
        id: id,
        ...updateProductDto,
      });

      // Verifica si se actualizó el producto, si no, lanza una excepción
      if (!product) {
        throw new NotFoundException(`Product with id: ${id} not found`);
      }

      await this.productRepository.save(product);

      return product;

    } catch (error) {
      this.errorHandler.errorHandle(error);
    }
  }

  async remove(id: string) {
    try {
      // Elimina el producto con el ID dado
      const product = await this.findOne(id);
      // Verifica si se eliminó el producto, si no, lanza una excepción
      if (!product) {
        throw new NotFoundException(`Product with UUID ${id} not found`);
      }

      await this.productRepository.remove(product);
      return `Product with UUID ${id} has been deleted`;

    } catch (error) {
      this.errorHandler.errorHandle(error);
    }
  }

}
