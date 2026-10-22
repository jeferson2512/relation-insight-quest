# Quiz — Mapa Fácil da IA

Adaptação em português com azul escuro, laranja e branco.

## Fluxo

Abertura → 22 etapas (perguntas, nome opcional e demonstrações) → resumo por interesse → dois pacotes → checkout externo.

A recomendação usa o último tema escolhido. Não existe diagnóstico, promessa de renda, avaliação por IA ou geração de arquivos personalizados. Nenhuma resposta é enviada ao antigo backend; os dados ficam em memória e são apagados ao recarregar a página.

## Configurar checkout

Em `src/lib/mapa-quiz.ts`, preencha `CHECKOUT.essential` e `CHECKOUT.complete` com as URLs HTTPS de cada pacote. Enquanto vazios, os botões informam que o checkout não foi disponibilizado e não abrem pagamento.

Preços: Essencial R$ 19,90; Completo R$ 39,90. Revise as instruções de entrega e garantia conforme a plataforma escolhida antes de publicar.

As demonstrações são exemplos ilustrativos. A implementação do quiz não cria os PDFs do produto: produza e carregue os arquivos de cada pacote na plataforma antes de iniciar vendas.

## Projeto conectado ao Lovable

As alterações estão locais. Para aparecerem no Lovable, precisam ser enviadas ao repositório conectado. Não reescreva o histórico publicado.

## Arquivos antigos

O projeto já continha configuração, funções e webhook de outro produto. Foram preservados, mas o novo quiz não os importa nem inicia pagamentos por eles. O checkout do kit usa somente as URLs explicitamente configuradas em `mapa-quiz.ts`.
