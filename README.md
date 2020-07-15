# TelegramBotCasal
Telegram bot para ajudar casais nas tarefas do dia a dia

## Funções
Atualmente, é possível:
1. Selecionar um prato aleatório
2. Adicionar novo prato
3. Editar um prato existente
4. Remover um prato existente


## Pendências
- [ ] Será necessário mostrar os resultados de forma paginada, já que fatalmente a lista crescerá
- [ ] Será necessário abstrair mecanismo para criação destas interações
  - Criação de lista com pratos de delivery apenas
  - Criação de lista para supermercado
    - É possível adicionar checkbox nesta lista, por exemplo?

# Deploy
Para fazer o deploy, executar o seguinte:

```bash
git push heroku master
```

Após o app ficar no ar, executar o comando abaixo para rodar **worker** dynos ao invés de **web**
```bash
 heroku ps:scale web=0 worker=1
```

## Comandos auxiliares

1. Para verificar os apps rodando, número de horas restantes 
    ```bash
    heroku ps -a telegram-bot-casal
    ```
2. Para testar o app localmente, antes do deploy, usar:
    ```bash
    heroku local
    ```