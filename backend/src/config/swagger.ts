import swaggerJSDoc from 'swagger-jsdoc';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'API de Veículos',
    version: '1.0.0',
    description: 'API para gerenciamento de veículos, vendedores, imagens e processamento de pagamentos simulados.',
    contact: {
      name: 'Suporte Técnico',
      email: 'suporte@carrovendido.com.br'
    }
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Servidor de Desenvolvimento'
    }
  ],
  tags: [
    { name: 'Veículos', description: 'Operações relacionadas a veículos' },
    { name: 'Vendedores', description: 'Operações relacionadas a vendedores' },
    { name: 'Imagens', description: 'Operações relacionadas a imagens de veículos' },
    { name: 'Webhooks', description: 'Endpoints para recebimento de notificações externas' },
    { name: 'Pagamentos', description: 'Operações relacionadas a pagamentos (incluindo simulação)' },
    { name: 'Saúde', description: 'Verificação de status da API' }
  ],
  components: {
    schemas: {
      Vehicle: {
        type: 'object',
        properties: {
          id: {
            type: 'integer',
            description: 'ID único do veículo',
            example: 1
          },
          brand: {
            type: 'string',
            description: 'Marca do veículo',
            example: 'Toyota'
          },
          model: {
            type: 'string',
            description: 'Modelo do veículo',
            example: 'Corolla'
          },
          year: {
            type: 'integer',
            description: 'Ano de fabricação',
            example: 2022
          },
          color: {
            type: 'string',
            description: 'Cor do veículo',
            example: 'Prata'
          },
          price: {
            type: 'number',
            format: 'float',
            description: 'Preço do veículo',
            example: 120000.50
          },
          sold: {
            type: 'boolean',
            description: 'Indica se o veículo foi vendido',
            example: false
          },
          buyerCPF: {
            type: 'string',
            description: 'CPF do comprador (apenas quando vendido)',
            example: '123.456.789-00',
            nullable: true
          },
          saleDate: {
            type: 'string',
            format: 'date-time',
            description: 'Data da venda (apenas quando vendido)',
            example: '2023-01-15T14:30:00Z',
            nullable: true
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'Data de criação do registro',
            example: '2023-01-01T10:00:00Z'
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            description: 'Data da última atualização',
            example: '2023-01-01T10:00:00Z'
          }
        }
      },
      CreateVehicleRequest: {
        type: 'object',
        required: ['brand', 'model', 'year', 'color', 'price'],
        properties: {
          brand: {
            type: 'string',
            example: 'Honda'
          },
          model: {
            type: 'string',
            example: 'Civic'
          },
          year: {
            type: 'integer',
            example: 2023
          },
          color: {
            type: 'string',
            example: 'Preto'
          },
          price: {
            type: 'number',
            format: 'float',
            example: 135000.00
          }
        }
      },
      UpdateVehicleRequest: {
        type: 'object',
        properties: {
          brand: {
            type: 'string',
            example: 'Honda'
          },
          model: {
            type: 'string',
            example: 'Civic'
          },
          year: {
            type: 'integer',
            example: 2023
          },
          color: {
            type: 'string',
            example: 'Azul'
          },
          price: {
            type: 'number',
            format: 'float',
            example: 132000.00
          }
        }
      },
      SellVehicleRequest: {
        type: 'object',
        required: ['buyerCPF'],
        properties: {
          buyerCPF: {
            type: 'string',
            example: '987.654.321-00'
          }
        }
      },
      SellVehicleResponse: {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            example: 'success'
          },
          data: {
            type: 'object',
            properties: {
              vehicle: {
                $ref: '#/components/schemas/Vehicle'
              },
              paymentLink: {
                type: 'string',
                example: 'https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=123456789'
              }
            }
          }
        }
      },
      Payment: {
        type: 'object',
        properties: {
          id: {
            type: 'integer',
            description: 'ID único do pagamento',
            example: 1
          },
          externalId: {
            type: 'string',
            description: 'ID do pagamento no provedor externo',
            example: 'PREF_12345678'
          },
          status: {
            type: 'string',
            description: 'Status do pagamento',
            example: 'pending',
            enum: ['pending', 'approved', 'cancelled', 'refunded']
          },
          amount: {
            type: 'number',
            format: 'float',
            description: 'Valor do pagamento',
            example: 120000.50
          },
          paymentMethod: {
            type: 'string',
            description: 'Método de pagamento',
            example: 'mercado_pago'
          },
          paymentLink: {
            type: 'string',
            description: 'Link para pagamento',
            example: 'https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=123456789'
          },
          vehicleId: {
            type: 'integer',
            description: 'ID do veículo relacionado',
            example: 1
          },
          buyerCPF: {
            type: 'string',
            description: 'CPF do comprador',
            example: '123.456.789-00'
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'Data de criação do registro',
            example: '2023-01-01T10:00:00Z'
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            description: 'Data da última atualização',
            example: '2023-01-01T10:00:00Z'
          }
        }
      },
      PaymentResponse: {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            example: 'success'
          },
          message: {
            type: 'string',
            example: 'Simulação processada com sucesso.'
          },
          payment: {
            $ref: '#/components/schemas/Payment'
          }
        }
      },
      Seller: {
        type: 'object',
        properties: {
          id: { type: 'integer', description: 'ID único do vendedor', example: 1 },
          name: { type: 'string', description: 'Nome do vendedor', example: 'João Silva' },
          email: { type: 'string', format: 'email', description: 'Email do vendedor', example: 'joao.silva@example.com' },
          phone: { type: 'string', description: 'Telefone do vendedor', example: '(11) 99999-8888' },
          gender: { type: 'string', description: 'Gênero', example: 'Masculino', nullable: true },
          birthDate: { type: 'string', format: 'date', description: 'Data de nascimento', example: '1990-05-15', nullable: true },
          cpf: { type: 'string', description: 'CPF do vendedor', example: '111.222.333-44' },
          zipCode: { type: 'string', description: 'CEP', example: '01001-000', nullable: true },
          createdAt: { type: 'string', format: 'date-time', description: 'Data de criação' },
          updatedAt: { type: 'string', format: 'date-time', description: 'Data de atualização' }
        }
      },
      CreateSellerRequest: {
        type: 'object',
        required: ['name', 'email', 'phone', 'cpf'],
        properties: {
          name: { type: 'string', example: 'Maria Oliveira' },
          email: { type: 'string', format: 'email', example: 'maria.oliveira@example.com' },
          phone: { type: 'string', example: '(21) 98888-7777' },
          gender: { type: 'string', nullable: true },
          birthDate: { type: 'string', format: 'date', nullable: true },
          cpf: { type: 'string', example: '444.555.666-77' },
          zipCode: { type: 'string', nullable: true }
        }
      },
      UpdateSellerRequest: {
        type: 'object',
        properties: {
          name: { type: 'string', example: 'Maria Oliveira Santos' },
          email: { type: 'string', format: 'email', example: 'maria.santos@example.com' },
          phone: { type: 'string', example: '(21) 98888-7777' },
          gender: { type: 'string', nullable: true },
          birthDate: { type: 'string', format: 'date', nullable: true },
          cpf: { type: 'string', example: '444.555.666-77' },
          zipCode: { type: 'string', nullable: true }
        }
      },
      SellerResponse: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          name: { type: 'string' },
          email: { type: 'string', format: 'email' },
          phone: { type: 'string' },
          gender: { type: 'string', nullable: true },
          birthDate: { type: 'string', format: 'date', nullable: true },
          cpf: { type: 'string' },
          zipCode: { type: 'string', nullable: true },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
          vehicles: {
            type: 'array',
            items: { type: 'integer' },
            description: 'IDs dos veículos associados a este vendedor',
            nullable: true
          }
        }
      },
      VehicleImage: {
        type: 'object',
        properties: {
          id: { type: 'integer', description: 'ID único da imagem' },
          filename: { type: 'string', description: 'Nome do arquivo original' },
          url: { type: 'string', format: 'url', description: 'URL pública da imagem' },
          description: { type: 'string', nullable: true, description: 'Descrição da imagem' },
          isPrimary: { type: 'boolean', description: 'Indica se é a imagem principal do veículo' },
          vehicleId: { type: 'integer', description: 'ID do veículo associado' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      },
      CreateVehicleImageRequest: {
         type: 'object',
         properties: {
           image: {
             type: 'string',
             format: 'binary',
             description: 'Arquivo da imagem a ser carregado.'
           },
           description: {
             type: 'string',
             description: 'Descrição opcional da imagem.',
             nullable: true
           },
           isPrimary: {
             type: 'boolean',
             description: 'Marcar como imagem principal? (Padrão: false)',
             default: false
           }
         }
       },
      UpdateVehicleImageRequest: {
        type: 'object',
        properties: {
          description: { type: 'string', nullable: true, description: 'Nova descrição da imagem' },
          isPrimary: { type: 'boolean', nullable: true, description: 'Definir como imagem principal' }
        }
      },
      VehicleImageResponse: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          filename: { type: 'string' },
          url: { type: 'string', format: 'url' },
          description: { type: 'string', nullable: true },
          isPrimary: { type: 'boolean' },
          vehicleId: { type: 'integer' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            example: 'error'
          },
          message: {
            type: 'string',
            example: 'Um ou mais campos são inválidos.'
          },
          errors: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                field: {
                  type: 'string',
                  example: 'price'
                },
                message: {
                  type: 'string',
                  example: 'O preço deve ser maior que zero'
                }
              }
            }
          }
        }
      }
    },
    responses: {
      BadRequest: {
        description: 'Requisição inválida (ex: dados faltando, formato incorreto)',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' }
          }
        }
      },
      Unauthorized: {
         description: 'Não autorizado (ex: token JWT inválido ou ausente)',
         content: {
           'application/json': {
             schema: {
               type: 'object',
               properties: {
                 status: { type: 'string', example: 'error' },
                 message: { type: 'string', example: 'Acesso não autorizado.' }
               }
             }
           }
         }
       },
      NotFound: {
        description: 'Recurso não encontrado',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                status: { type: 'string', example: 'error' },
                message: { type: 'string', example: 'Recurso não encontrado.' }
              }
            }
          }
        }
      },
      Conflict: {
         description: 'Conflito (ex: tentar criar recurso que já existe com identificador único)',
         content: {
           'application/json': {
             schema: {
               type: 'object',
               properties: {
                 status: { type: 'string', example: 'error' },
                 message: { type: 'string', example: 'Já existe um recurso com este identificador.' }
               }
             }
           }
         }
       },
      InternalError: {
        description: 'Erro interno do servidor',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                status: { type: 'string', example: 'error' },
                message: { type: 'string', example: 'Ocorreu um erro inesperado no servidor.' }
              }
            }
          }
        }
      }
    },
    securitySchemes: {
       BearerAuth: {
         type: 'http',
         scheme: 'bearer',
         bearerFormat: 'JWT',
         description: 'Insira o token JWT Bearer para autenticação.'
       }
     }
  }
};

const swaggerOptions = {
  swaggerDefinition: swaggerDefinition,
  apis: ['./src/routes/**/*.ts', './src/controllers/**/*.ts'],
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

export { swaggerSpec };

