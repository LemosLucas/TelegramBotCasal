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
- [x] Será necessário abstrair mecanismo para criação destas interações
  - STATUS:
    - No meio da refatoração. O caso de seleção de prato aleatório já usa o arquivo `conversation.js` como base e suas abstrações
    - [ ] Como lidar com níveis de conversação mais profundos? Casos onde temos muitas sequências de perguntas e respostas?
      - Penso que vale a pena tocar com objetos aninhados e, posteriormente, refatorar, se for o caso
      - Talvez muitos casos se resumam a apenas mensagens pro usuário, sem mt processamento entre interações
  - Casos de uso:
    - Criação de lista para supermercado
      - É possível adicionar checkbox nesta lista, por exemplo?
    - Criação de lista com pratos de delivery apenas

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