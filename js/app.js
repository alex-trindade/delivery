class CardapioApp {
  constructor() {
    this.localStorageKey = "carrinho";
    this.valorEntrega = 7.5;
    this.celularEmpresa = "5517991234567";

    this.meuCarrinho =
      JSON.parse(localStorage.getItem(this.localStorageKey)) || [];
    this.meuEndereco = null;
    this.valorCarrinho = 0;

    this.templates = this.getTemplateItensCardapio();
    this.url = null;
  }

  init() {
    this.carregarItensCardapio();
    this.carregarBotaoLigar();
    this.carregarBotaoReserva();
    this.atualizarBadgeTotal();
  }

  carregarItensCardapio(categoria = "burgers", vermais = false) {
    const filtro = MENU[categoria];
    if (!vermais) {
      $("#itensCardapio").html("");
      $("#btnVerMais").removeClass("hidden");
    }

    $.each(filtro, (i, e) => {
      let temp = this.templates.item
        .replace(/\${img}/g, e.img)
        .replace(/\${nome}/g, e.name)
        .replace(/\${preco}/g, e.price.toFixed(2).replace(".", ","))
        .replace(/\${id}/g, e.id);

      if ((!vermais && i < 8) || (vermais && i >= 8 && i < 12)) {
        $("#itensCardapio").append(temp);
      }
    });

    $(".container-menu a").removeClass("active");
    $(`#menu-${categoria}`).addClass("active");
  }

  adicionarAoCarrinho(id) {
    this.meuCarrinho =
      JSON.parse(localStorage.getItem(this.localStorageKey)) || [];
    const qntd = parseInt($(`#qntd-${id}`).text());

    if (qntd > 0) {
      const categoria = $(".container-menu a.active")
        .attr("id")
        .split("menu-")[1];
      const item = MENU[categoria].find((e) => e.id == id);

      if (!item) return;

      const existente = this.meuCarrinho.find((e) => e.id == id);
      if (existente) {
        existente.qntd += qntd;
      } else {
        this.meuCarrinho.push({ ...item, qntd });
      }

      localStorage.setItem(
        this.localStorageKey,
        JSON.stringify(this.meuCarrinho)
      );
      this.mensagem("Item adicionado ao carrinho", "green");
      $(`#qntd-${id}`).text(0);
      this.atualizarBadgeTotal();
    }
  }

  // botão remover item do carrinho
  removerItemCarrinho(id) {
    var MEU_CARRINHO =
      JSON.parse(localStorage.getItem(this.localStorageKey)) || [];
    MEU_CARRINHO = $.grep(MEU_CARRINHO, (e, i) => {
      return e.id != id;
    });
    localStorage.setItem(this.localStorageKey, JSON.stringify(MEU_CARRINHO));
    this.carregarCarrinho();

    // atualiza o botão carrinho com a quantidade atualizada
    this.atualizarBadgeTotal();
  }

  // atualiza o carrinho com a quantidade atual
  atualizarCarrinho(id, qntd) {
    var MEU_CARRINHO =
      JSON.parse(localStorage.getItem(this.localStorageKey)) || [];
    let objIndex = MEU_CARRINHO.findIndex((obj) => obj.id == id);
    MEU_CARRINHO[objIndex].qntd = qntd;
    localStorage.setItem(this.localStorageKey, JSON.stringify(MEU_CARRINHO));
    // atualiza o botão carrinho com a quantidade atualizada
    this.atualizarBadgeTotal();

    // atualiza os valores (R$) totais do carrinho
    this.carregarValores();
  }

  atualizarBadgeTotal() {
    let total = this.meuCarrinho.reduce((acc, item) => acc + item.qntd, 0);

    $(".badge-total-carrinho").html(total);
    if (total > 0) {
      $(".botao-carrinho, .container-total-carrinho").removeClass("hidden");
    } else {
      $(".botao-carrinho, .container-total-carrinho").addClass("hidden");
    }
  }

  calcularValores() {
    this.valorCarrinho = this.meuCarrinho.reduce(
      (acc, item) => acc + item.price * item.qntd,
      0
    );

    $("#lblSubTotal").text(
      `R$ ${this.valorCarrinho.toFixed(2).replace(".", ",")}`
    );
    $("#lblValorEntrega").text(
      `+ R$ ${this.valorEntrega.toFixed(2).replace(".", ",")}`
    );
    $("#lblValorTotal").text(
      `R$ ${(this.valorCarrinho + this.valorEntrega)
        .toFixed(2)
        .replace(".", ",")}`
    );
  }

  gerarLinkPedidoWhatsApp() {
    if (this.meuCarrinho.length === 0 || !this.meuEndereco) return;

    let texto = "Olá! gostaria de fazer um pedido:";
    texto += "\n*Itens do pedido:*\n\n";
    this.meuCarrinho.forEach((item) => {
      texto += `*${item.qntd}x* ${item.name} ....... R$ ${item.price
        .toFixed(2)
        .replace(".", ",")}\n`;
    });

    texto += "\n*Endereço de entrega:*";
    texto += `\n${this.meuEndereco.endereco}, ${this.meuEndereco.numero}, ${this.meuEndereco.bairro}`;
    texto += `\n${this.meuEndereco.cidade}-${this.meuEndereco.uf} / ${this.meuEndereco.cep} ${this.meuEndereco.complemento}`;
    texto += `\n\n*Total (com entrega): R$ ${(
      this.valorCarrinho + this.valorEntrega
    )
      .toFixed(2)
      .replace(".", ",")}*`;

    this.url = `https://wa.me/${this.celularEmpresa}?text=${encodeURI(texto)}`;
    $("#btnEtapaResumo").attr("href", this.url);
  }

  carregarBotaoReserva() {
    const texto = "Olá! gostaria de fazer uma *reserva*";
    const url = `https://wa.me/${this.celularEmpresa}?text=${encodeURI(texto)}`;
    $("#btnReserva").attr("href", url);
  }

  carregarBotaoLigar() {
    $("#btnLigar").attr("href", `tel:${this.celularEmpresa}`);
  }

  mensagem(texto, cor = "red", tempo = 3500) {
    const id = Math.floor(Date.now() * Math.random()).toString();
    const msg = `<div id="msg-${id}" class="animated fadeInDown toast ${cor}">${texto}</div>`;
    $("#container-mensagens").append(msg);

    setTimeout(() => {
      $(`#msg-${id}`).removeClass("fadeInDown").addClass("fadeOutUp");
      setTimeout(() => {
        $(`#msg-${id}`).remove();
      }, 800);
    }, tempo);
  }

  getTemplateItensCardapio() {
    return {
      item: `
                <div class="col-12 col-lg-3 col-md-3 col-sm-6 mb-5 animated fadeInUp">
                    <div class="card card-item" id="\${id}">
                        <div class="img-produto"><img src="\${img}" /></div>
                        <p class="title-produto text-center mt-4"><b>\${nome}</b></p>
                        <p class="price-produto text-center"><b>R$ \${preco}</b></p>
                        <div class="add-carrinho">
                            <span class="btn-menos" onclick="app.alterarQuantidade('\${id}', -1)"><i class="fas fa-minus"></i></span>
                            <span class="add-numero-itens" id="qntd-\${id}">0</span>
                            <span class="btn-mais" onclick="app.alterarQuantidade('\${id}', 1)"><i class="fas fa-plus"></i></span>
                            <span class="btn btn-add" onclick="app.adicionarAoCarrinho('\${id}')"><i class="fa fa-shopping-bag"></i></span>
                        </div>
                    </div>
                </div>
            `,
    };
  }

  getTemplateItensCarrinho() {
    return {
      item: `
        <div class="col-12 item-carrinho">
            <div class="img-produto">
                <img src="\${img}" />
            </div>
            <div class="dados-produto">
                <p class="title-produto"><b>\${nome}</b></p>
                <p class="price-produto"><b>R$ \${preco}</b></p>
            </div>
            <div class="add-carrinho">
                <span class="btn-menos" onclick="app.diminuirQuantidadeCarrinho('\${id}')"><i class="fas fa-minus"></i></span>
                <span class="add-numero-itens" id="qntd-carrinho-\${id}">\${qntd}</span>
                <span class="btn-mais" onclick="app.aumentarQuantidadeCarrinho('\${id}')"><i class="fas fa-plus"></i></span>
                <span class="btn btn-remove no-mobile" onclick="app.removerItemCarrinho('\${id}')"><i class="fa fa-times"></i></span>
            </div>
        </div>
    `,
    };
  }

  getTemplateItensResumo() {
    return {
      itemResumo: `
        <div class="col-12 item-carrinho resumo">
            <div class="img-produto-resumo">
                <img src="\${img}" />
            </div>
            <div class="dados-produto">
                <p class="title-produto-resumo">
                    <b>\${nome}</b>
                </p>
                <p class="price-produto-resumo">
                    <b>R$ \${preco}</b>
                </p>
            </div>
            <p class="quantidade-produto-resumo">
                x <b>\${qntd}</b>
            </p>
        </div>
    `,
    };
  }

  alterarQuantidade(id, delta) {
    const el = $(`#qntd-${id}`);
    let atual = parseInt(el.text());
    let nova = atual + delta;
    if (nova >= 0) {
      el.text(nova);
    }
  }

  // abrir a modal de carrinho
  abrirCarrinho(abrir) {
    if (abrir) {
      $("#modalCarrinho").removeClass("hidden");
      this.carregarCarrinho();
    } else {
      $("#modalCarrinho").addClass("hidden");
    }
  }

  carregarCarrinho() {
    this.meuCarrinho =
      JSON.parse(localStorage.getItem(this.localStorageKey)) || [];
    this.carregarEtapa(1);

    if (this.meuCarrinho.length > 0) {
      $("#itensCarrinho").html("");

      $.each(this.meuCarrinho, (i, e) => {
        let temp = app
          .getTemplateItensCarrinho()
          .item.replace(/\${img}/g, e.img)
          .replace(/\${nome}/g, e.name)
          .replace(/\${preco}/g, e.price.toFixed(2).replace(".", ","))
          .replace(/\${id}/g, e.id)
          .replace(/\${qntd}/g, e.qntd);

        $("#itensCarrinho").append(temp);

        // último item
        if (i + 1 == this.meuCarrinho.length) {
          this.carregarValores();
        }
      });
    } else {
      $("#itensCarrinho").html(
        '<p class="carrinho-vazio"><i class="fa fa-shopping-bag"></i> Seu carrinho está vazio.</p>'
      );
      this.carregarValores();
    }
  }

  diminuirQuantidadeCarrinho(id) {
    let qntdAtual = parseInt($("#qntd-carrinho-" + id).text());

    if (qntdAtual > 1) {
      $("#qntd-carrinho-" + id).text(qntdAtual - 1);
      this.atualizarCarrinho(id, qntdAtual - 1);
    } else {
      this.removerItemCarrinho(id);
    }
  }

  // aumentar quantidade do item no carrinho
  aumentarQuantidadeCarrinho(id) {
    let qntdAtual = parseInt($("#qntd-carrinho-" + id).text());
    $("#qntd-carrinho-" + id).text(qntdAtual + 1);
    this.atualizarCarrinho(id, qntdAtual + 1);
  }

  // carregar a etapa enderecos
  carregarEndereco() {
    if (this.meuCarrinho.length <= 0) {
      this.mensagem("Seu carrinho está vazio.");
      return;
    }

    this.carregarEtapa(2);
  }

  // botão de voltar etapa
  voltarEtapa() {
    let etapa = $(".etapa.active").length;
    this.carregarEtapa(etapa - 1);
  }
  carregarEtapa(etapa) {
    if (etapa == 1) {
      $("#lblTituloEtapa").text("Seu carrinho:");
      $("#itensCarrinho").removeClass("hidden");
      $("#localEntrega").addClass("hidden");
      $("#resumoCarrinho").addClass("hidden");

      $(".etapa").removeClass("active");
      $(".etapa1").addClass("active");

      $("#btnEtapaPedido").removeClass("hidden");
      $("#btnEtapaEndereco").addClass("hidden");
      $("#btnEtapaResumo").addClass("hidden");
      $("#btnVoltar").addClass("hidden");
    }

    if (etapa == 2) {
      $("#lblTituloEtapa").text("Endereço de entrega:");
      $("#itensCarrinho").addClass("hidden");
      $("#localEntrega").removeClass("hidden");
      $("#resumoCarrinho").addClass("hidden");

      $(".etapa").removeClass("active");
      $(".etapa1").addClass("active");
      $(".etapa2").addClass("active");

      $("#btnEtapaPedido").addClass("hidden");
      $("#btnEtapaEndereco").removeClass("hidden");
      $("#btnEtapaResumo").addClass("hidden");
      $("#btnVoltar").removeClass("hidden");
    }

    if (etapa == 3) {
      $("#lblTituloEtapa").text("Resumo do pedido:");
      $("#itensCarrinho").addClass("hidden");
      $("#localEntrega").addClass("hidden");
      $("#resumoCarrinho").removeClass("hidden");

      $(".etapa").removeClass("active");
      $(".etapa1").addClass("active");
      $(".etapa2").addClass("active");
      $(".etapa3").addClass("active");

      $("#btnEtapaPedido").addClass("hidden");
      $("#btnEtapaEndereco").addClass("hidden");
      $("#btnEtapaResumo").removeClass("hidden");
      $("#btnVoltar").removeClass("hidden");
    }
  }

  resumoPedido() {
    let cep = $("#txtCEP").val().trim();
    let endereco = $("#txtEndereco").val().trim();
    let bairro = $("#txtBairro").val().trim();
    let cidade = $("#txtCidade").val().trim();
    let uf = $("#ddlUf").val().trim();
    let numero = $("#txtNumero").val().trim();
    let complemento = $("#txtComplemento").val().trim();

    if (cep.length <= 0) {
      this.mensagem("Informe o CEP, por favor.");
      $("#txtCEP").focus();
      return;
    }

    if (endereco.length <= 0) {
      this.mensagem("Informe o Endereço, por favor.");
      $("#txtEndereco").focus();
      return;
    }

    if (bairro.length <= 0) {
      this.mensagem("Informe o Bairro, por favor.");
      $("#txtBairro").focus();
      return;
    }

    if (cidade.length <= 0) {
      this.mensagem("Informe a Cidade, por favor.");
      $("#txtCidade").focus();
      return;
    }

    if (uf == "-1") {
      this.mensagem("Informe a UF, por favor.");
      $("#ddlUf").focus();
      return;
    }

    if (numero.length <= 0) {
      this.mensagem("Informe o Número, por favor.");
      $("#txtNumero").focus();
      return;
    }

    this.meuEndereco = {
      cep: cep,
      endereco: endereco,
      bairro: bairro,
      cidade: cidade,
      uf: uf,
      numero: numero,
      complemento: complemento,
    };

    this.carregarEtapa(3);
    this.carregarResumo();
  }

  // carrega a etapa de Resumo do pedido
  carregarResumo() {
    this.meuCarrinho =
      JSON.parse(localStorage.getItem(this.localStorageKey)) || [];
    $("#listaItensResumo").html("");

    $.each(this.meuCarrinho, (i, e) => {
      let temp = app
        .getTemplateItensResumo()
        .itemResumo.replace(/\${img}/g, e.img)
        .replace(/\${nome}/g, e.name)
        .replace(/\${preco}/g, e.price.toFixed(2).replace(".", ","))
        .replace(/\${qntd}/g, e.qntd);

      $("#listaItensResumo").append(temp);
    });

    $("#resumoEndereco").html(
      `${this.meuEndereco.endereco}, ${this.meuEndereco.numero}, ${this.meuEndereco.bairro}`
    );
    $("#cidadeEndereco").html(
      `${this.meuEndereco.cidade}-${this.meuEndereco.uf} / ${this.meuEndereco.cep} ${this.meuEndereco.complemento}`
    );

    this.gerarLinkPedidoWhatsApp();
  }

  // Atualiza o link do botão do WhatsApp
  finalizarPedido() {
    setTimeout(() => {
      localStorage.removeItem(this.localStorageKey);
      this.meuCarrinho = [];
      this.meuEndereco = null;
      this.valorCarrinho = 0;
      this.url = null;
      $("#itensCardapio").html("");
      $("#itensCarrinho").html("");
      $("#listaItensResumo").html("");
      $("#resumoEndereco").html("");
      $("#cidadeEndereco").html("");
      $("#btnEtapaResumo").attr("href", "#");

      this.carregarItensCardapio();
      this.atualizarBadgeTotal();
      this.carregarValores();
      this.abrirCarrinho(false);
    }, 3500);
  }

  resetarPedido() {
    localStorage.removeItem(this.localStorageKey);
    this.meuCarrinho = [];
    this.meuEndereco = null;
    this.valorCarrinho = 0;
    this.url = null;
    $("#itensCardapio").html("");
    $("#itensCarrinho").html("");
    $("#listaItensResumo").html("");
    $("#resumoEndereco").html("");
    $("#cidadeEndereco").html("");
    $("#btnEtapaResumo").attr("href", "#");

    this.carregarItensCardapio();
    this.atualizarBadgeTotal();
    this.carregarValores();
    this.abrirCarrinho(false);
  }

  carregarValores() {
    this.meuCarrinho =
      JSON.parse(localStorage.getItem(this.localStorageKey)) || [];
    this.valorCarrinho = 0;

    $("#lblSubTotal").text("R$ 0,00");
    $("#lblValorEntrega").text("+ R$ 0,00");
    $("#lblValorTotal").text("R$ 0,00");

    $.each(this.meuCarrinho, (i, e) => {
      this.valorCarrinho += parseFloat(e.price * e.qntd);

      if (i + 1 == this.meuCarrinho.length) {
        $("#lblSubTotal").text(
          `R$ ${this.valorCarrinho.toFixed(2).replace(".", ",")}`
        );
        $("#lblValorEntrega").text(
          `+ R$ ${this.valorEntrega.toFixed(2).replace(".", ",")}`
        );
        $("#lblValorTotal").text(
          `R$ ${(this.valorCarrinho + this.valorEntrega)
            .toFixed(2)
            .replace(".", ",")}`
        );
      }
    });
  }
  // abre o depoimento
  abrirDepoimento(depoimento) {
    $("#depoimento-1").addClass("hidden");
    $("#depoimento-2").addClass("hidden");
    $("#depoimento-3").addClass("hidden");

    $("#btnDepoimento-1").removeClass("active");
    $("#btnDepoimento-2").removeClass("active");
    $("#btnDepoimento-3").removeClass("active");

    $("#depoimento-" + depoimento).removeClass("hidden");
    $("#btnDepoimento-" + depoimento).addClass("active");
  }
}

const app = new CardapioApp();
$(document).ready(() => {
  app.init();
});
