<p align="center">
  <a href="https://strapi.io">
    <img src="http://igerp.com.br/imgs/logo.png" width="250px" alt="Irmãos Gonçalves" />
  </a>
</p>
<h3 align="center">NODE-HMG - Homologação Node.js.</h3>
<p align="center">
  <a title='Group' https://www.irmaosgoncalves.com.br/" height="18">
    <img src='https://img.shields.io/badge/grupo-irmaosgoncalves-008E38.svg' />
  </a>
  <a title='Version' href="https://github.com/tiig/md043" height="18">
    <img src='https://img.shields.io/badge/version-0.0.2-blue.svg' />
  </a>
  <a title='License' href="https://www.isc.org/licenses" height="18">
    <img src='https://img.shields.io/badge/license-ISC-green.svg' />
  </a>
</p>

## 🖐 Requisitos
**Sistema Operacional:**
- Windows 10
- CentOS
- Ubuntu

**Node:**
- NodeJS 10.x
- NPM >= 6.x

**Banco de Dados:**
- SQL Server

## ⏳ Instalação
#### Baixe o repositório
```bash
$ git clone git@github.com:miranda-ig/node-hmg.git
```
#### Entre no diretório raiz
```bash
$ cd node-hmg
```
#### Copie o arquivo de configuração e altere as configurações:
```bash
$ cp .env.example .env
```
- Altere as configurações:
  - APP_HOST para http: + ip do servidor
  - APP_KEY com a chave de criptografia da aplicação
  - Acesso à bases de dados

#### Instale as dependências
```bash
$ yarn
```
#### Efetue o build da aplicação
```bash
$ yarn build
```
#### Inicialize o servidor
```bash
$ yarn start
```
## © Licença

[ISC License](https://www.isc.org/licenses) Copyright (c) 2019 [Irmãos Gonçalves](https://www.irmaosgoncalves.com.br/).
