document.addEventListener('DOMContentLoaded', function () {
  function closest(element, selector) {
    if (Element.prototype.closest) {
      return element.closest(selector);
    }
    do {
      if (Element.prototype.matches && element.matches(selector)
        || Element.prototype.msMatchesSelector && element.msMatchesSelector(selector)
        || Element.prototype.webkitMatchesSelector && element.webkitMatchesSelector(selector)) {
        return element;
      }
      element = element.parentElement || element.parentNode;
    } while (element !== null && element.nodeType === 1);
    return null;
  }

  // social share popups
  Array.prototype.forEach.call(document.querySelectorAll('.share a'), function (anchor) {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      window.open(this.href, '', 'height = 500, width = 500');
    });
  });

  // show form controls when the textarea receives focus or backbutton is used and value exists
  var commentContainerTextarea = document.querySelector('.comment-container textarea'),
    commentContainerFormControls = document.querySelector('.comment-form-controls, .comment-ccs');

  if (commentContainerTextarea) {
    commentContainerTextarea.addEventListener('focus', function focusCommentContainerTextarea() {
      commentContainerFormControls.style.display = 'block';
      commentContainerTextarea.removeEventListener('focus', focusCommentContainerTextarea);
    });

    if (commentContainerTextarea.value !== '') {
      commentContainerFormControls.style.display = 'block';
    }
  }

  // Expand Request comment form when Add to conversation is clicked
  var showRequestCommentContainerTrigger = document.querySelector('.request-container .comment-container .comment-show-container'),
    requestCommentFields = document.querySelectorAll('.request-container .comment-container .comment-fields'),
    requestCommentSubmit = document.querySelector('.request-container .comment-container .request-submit-comment');

  if (showRequestCommentContainerTrigger) {
    showRequestCommentContainerTrigger.addEventListener('click', function () {
      showRequestCommentContainerTrigger.style.display = 'none';
      Array.prototype.forEach.call(requestCommentFields, function (e) { e.style.display = 'block'; });
      requestCommentSubmit.style.display = 'inline-block';

      if (commentContainerTextarea) {
        commentContainerTextarea.focus();
      }
    });
  }

  // Mark as solved button
  var requestMarkAsSolvedButton = document.querySelector('.request-container .mark-as-solved:not([data-disabled])'),
    requestMarkAsSolvedCheckbox = document.querySelector('.request-container .comment-container input[type=checkbox]'),
    requestCommentSubmitButton = document.querySelector('.request-container .comment-container input[type=submit]');

  if (requestMarkAsSolvedButton) {
    requestMarkAsSolvedButton.addEventListener('click', function () {
      requestMarkAsSolvedCheckbox.setAttribute('checked', true);
      requestCommentSubmitButton.disabled = true;
      this.setAttribute('data-disabled', true);
      // Element.closest is not supported in IE11
      closest(this, 'form').submit();
    });
  }

  // Change Mark as solved text according to whether comment is filled
  var requestCommentTextarea = document.querySelector('.request-container .comment-container textarea');

  if (requestCommentTextarea) {
    requestCommentTextarea.addEventListener('input', function () {
      if (requestCommentTextarea.value === '') {
        if (requestMarkAsSolvedButton) {
          requestMarkAsSolvedButton.innerText = requestMarkAsSolvedButton.getAttribute('data-solve-translation');
        }
        requestCommentSubmitButton.disabled = true;
      } else {
        if (requestMarkAsSolvedButton) {
          requestMarkAsSolvedButton.innerText = requestMarkAsSolvedButton.getAttribute('data-solve-and-submit-translation');
        }
        requestCommentSubmitButton.disabled = false;
      }
    });
  }

  // Disable submit button if textarea is empty
  if (requestCommentTextarea && requestCommentTextarea.value === '') {
    requestCommentSubmitButton.disabled = true;
  }

  // Submit requests filter form in the request list page
  Array.prototype.forEach.call(document.querySelectorAll('#request-status-select, #request-organization-select'), function (el) {
    el.addEventListener('change', function (e) {
      e.stopPropagation();
      closest(this, 'form').submit();
    });
  });

  function toggleNavigation(toggleElement) {
    var menu = document.getElementById('user-nav');
    var isExpanded = menu.getAttribute('aria-expanded') === 'true';
    menu.setAttribute('aria-expanded', !isExpanded);
    toggleElement.setAttribute('aria-expanded', !isExpanded);
  }

  var burgerMenu = document.querySelector('.header .icon-menu');
  var userMenu = document.querySelector('#user-nav');

  burgerMenu.addEventListener('click', function (e) {
    e.stopPropagation();
    toggleNavigation(this);
  });

  burgerMenu.addEventListener('keyup', function (e) {
    if (e.keyCode === 13) { // Enter key
      e.stopPropagation();
      toggleNavigation(this);
    }
  });

  userMenu.addEventListener('keyup', function (e) {
    if (e.keyCode === 27) { // Escape key
      e.stopPropagation();
      this.setAttribute('aria-expanded', false);
      burgerMenu.setAttribute('aria-expanded', false);
    }
  });

  if (userMenu.children.length === 0) {
    burgerMenu.style.display = 'none';
  }

  // Submit organization form in the request page
  var requestOrganisationSelect = document.querySelector('#request-organization select');

  if (requestOrganisationSelect) {
    requestOrganisationSelect.addEventListener('change', function () {
      closest(this, 'form').submit();
    });
  }

  // Toggles expanded aria to collapsible elements
  Array.prototype.forEach.call(document.querySelectorAll('.collapsible-nav, .collapsible-sidebar'), function (el) {
    el.addEventListener('click', function (e) {
      e.stopPropagation();
      var isExpanded = this.getAttribute('aria-expanded') === 'true';
      this.setAttribute('aria-expanded', !isExpanded);
    });
  });

  // If a section has more than 6 subsections, we collapse the list, and show a trigger to display them all
  const seeAllTrigger = document.querySelector("#see-all-sections-trigger");
  const subsectionsList = document.querySelector(".section-list");

  if (subsectionsList && subsectionsList.children.length > 6) {
    seeAllTrigger.setAttribute("aria-hidden", false);

    seeAllTrigger.addEventListener("click", function (e) {
      subsectionsList.classList.remove("section-list--collapsed");
      seeAllTrigger.parentNode.removeChild(seeAllTrigger);
    });
  }

  var twilioWebChat = null;
  var opcaoGate = null;
  var empresa = {
    cnpj: '',
    plano: '',
    ramosAtividade: [],
    isSimples: ''
  }

  $(document).ready(function () {
    function initTwilioChat() {
      if (!Twilio) return;

      var MainHeader = {
        MainHeader: {
          Container: {
            background: "#1F73B7",
            color: "#FFFFFF"
          },
          Logo: {
            fill: '#FFFFFF'
          }
        }
      }

      if (!empresa.cnpj) {
        Sentry.captureMessage('Usuário sem CNPJ: ' + HelpCenter.user.email);
      }

      var appConfig = {
        accountSid: "AC8f0f5116338167901ab4409d4981c5bb",
        flexFlowSid: "FOedf9c0b535455e260f6d6c73dabe83fa",
        context: {
          friendlyName: HelpCenter.user.name,
          email: HelpCenter.user.email,
          guide: 'webchat',
          id: empresa.cnpj || 'SEM_CNPJ'
        },
        componentProps: {
          MainHeader: {
            titleText: 'Contabilizei'
          }
        },
        colorTheme: {
          overrides: MainHeader,
        },
        disableLocalStorage: true,
        fileAttachment: {
          enabled: true,
          acceptedExtensions: ["jpeg", "jpg", "png", "gif", "txt", "pdf", "doc", "docx", "xls", "xlsx"]
        }
      }

      Twilio.FlexWebChat.createWebChat(appConfig).then(webchat => {
        webchat.manager.strings = { //Tradução
          ...webchat._manager.strings,
          EntryPointTagline: "Fale com a gente",
          MessageCanvasTrayContent: `
            <h6>Obrigado pelo contato!</h6>
            <p>Caso ainda tenha dúvidas, por favor entre em contato conosco novamente.</p>`,
          InvalidPreEngagementButton: "Leia mais",
          PredefinedChatMessageAuthorName: "Contabilizei",
          PredefinedChatMessageBody: "Olá! Como posso te ajudar?",
          InputPlaceHolder: "Escreva uma mensagem...",
          TypingIndicator: "Nosso agente está digitando ... ",
          Read: "Lida",
          MessageSendingDisabled: "Enviar mensagem desabilitado",
          Today: "HOJE",
          Yesterday: "ONTEM",
          MessageCanvasTrayButton: "INICIAR NOVA CONVERSA",
          WelcomeMessage: "Bem-vindo(a) ao atendimento Contabilizei",
          Save: "SALVAR",
          Reset: "LIMPAR",
          SendMessageTooltip: "Enviar Mensagem",
          FieldValidationRequiredField: "Campo obrigatório",
          FieldValidationInvalidEmail: "Por favor, insira um e-mail válido",
          AttachFileImageTooltip: "Anexar imagem ou arquivo",
          AttachFileInvalidSize: "O arquivo é muito grande para anexar. O tamanho máximo deve ser 10MB.",
          AttachFileInvalidType: "O arquivo não pode ser anexado pois o tipo do arquivo não é suportado.",
          ConfirmEndEngagementMessage: "Tem certeza que quer encerrar o chat?",
          Connecting: "Conectando …",
          DownloadFileInvalidSize: "{O arquivo é muito grande para baixar. O tamanho máximo pertimitido é 10MB.",
          DownloadFileInvalidType: "{O arquivo não pode ser baixado pois o tipo do arquivo não é suportado.",
          DownloadFileNotParticipant: "Não foi possível baixar o arquivo. Você não é participante deste chat.",
          FileAttachmentDropAreaSubtitle: "Solte o arquivo aqui",
          FileAttachmentDropAreaTitle: "Anexar imagem ou arquivo",
          FilterItemAmountSelected: "Você possui um ou mais itens selecionado(s)",
          FilterItemAny: "Qualquer",
          MediaMessageClickToOpen: "Abrir arquivo",
          MediaMessageError: "Mensagem de mídia não suportada",
          MediaMessageTransferFailed: "Falha no envio",
          MessageCharacterCountReached: "Limite de caracteres atingido",
          NewChatMessageNotificationTitle: "Nova mensagem",
          PendingEngagementCancelButton: "Cancelar",
          PendingEngagementMessage: "Aguarde enquanto te conectamos com um agente disponível",
          PreEngagementMandatoryFieldMessage: "Campo obrigatório *",
          SendMediaMessageInvalidSize: "O arquivo é muito grande para enviar. O tamanho máximo deve ser 10MB.",
          SendMediaMessageInvalidType: "O arquivo não pode ser enviado pois o tipo do arquivo não é suportado."
        }
        twilioWebChat = webchat;
      });
    }

    function openTwilioChat() {
      if (!twilioWebChat._initialized) {
        twilioWebChat.init();
      }

      Twilio.FlexWebChat.Actions.invokeAction("ToggleChatVisibility");
      $("#launcher").hide();
    }

    function openChatCanalExistente(zendesk) {
      if (opcaoGate) {
        openTwilioChat();
      } else {
        initZendeskChat(zendesk.departments);
        zE('webWidget', 'chat:addTags', zendesk.tags);
      }
    }

    function handleChat({ zendesk }) {
      const isEmpresaSomenteServico = empresa.ramosAtividade.length === 1 && empresa.ramosAtividade.includes('serviço');
      // problemas com twilio? exclua o if abaixo.
      if (isEmpresaSomenteServico && empresa.isSimples) {
        if (opcaoGate !== null) {
          openChatCanalExistente(zendesk);
          return;
        }

        fetch('https://tan-ibis-9438.twil.io/gate').then(function (response) {
          return response.json();
        }).then(function (data) {
          opcaoGate = data.option;
          if (data.option) {
            openTwilioChat();
            return;
          }

          initZendeskChat(zendesk.departments);
          zE('webWidget', 'chat:addTags', zendesk.tags);
        });
        return;
      }

      initZendeskChat(zendesk.departments);
      zE('webWidget', 'chat:addTags', zendesk.tags);
    }

    // INICIALIZACÃO
    $("#links-info-rendimento").hide();
    $("#links-info-notas").hide();
    $("#links-info-imposto").hide();
    $("#links-info-prolabore").hide();
    $("#links-info-documentacao").hide();
    $("#links-info-mensalidade").hide();
    $("#links-info-adicionais").hide();
    $("#links-info-alteracao-baixa").hide();
    $("#links-info-folha").hide();
    $("#links-info-outros-assuntos").hide();
    $("#semAcessoFone").hide();
    $("#semAcessoWhats").hide();
    $("#acessoFone").hide();
    $("#acessoWhats").hide();
    $("#comercio-title").hide();
    $("#comercio-contato").hide();
    var statusOrganization = false; // DEFINE SE EMPRESA É OU NÃO ATIVA
    var printWhats = false; // DEFINE SE DEVE SER EXIBIDO DADOS DE CONTATO WHATS/FONE
    var printFone = false;
    var isServicoOrIndustria = false;
    var isComercio = false;
    var isServico = false;
    var isIndustria = false;

    $.each(HelpCenter.user.organizations[0].tags, function (key, value) {
      if (value.includes('cnpj:')) {
        empresa.cnpj = value.split(':')[1];
      }

      if (value.includes('plano:')) {
        empresa.plano = value.split(':')[1];
      }

      if (value === 'simples') {
        empresa.isSimples = true;
      }

      if (value === "status:ativo") {
        statusOrganization = true;
      }

      if (value === "premium") {
        printWhats = true;
        printFone = true;
      }

      if (value === "avancado") {
        printWhats = true;
        printFone = false;
      }

      if (value == "serviço") {
        empresa.ramosAtividade.push(value);
        isServico = true;
      }

      if (value == "indústria") {
        empresa.ramosAtividade.push(value);
        isIndustria = true;
      }

      if (value === "comércio") {
        empresa.ramosAtividade.push(value);
        isComercio = true;
      }
    });

    isServicoOrIndustria = isServico || isIndustria;

    initTwilioChat();

    if (isComercio && !isServicoOrIndustria) {
      $("#comercio-title").show();
      $("#comercio-contato").show();
      $(".only-servico-channel").hide();
    }

    // FUNÇÕES
    function initZendeskChat(departments) {
      console.log("departamento", departments)
      zE('webWidget', 'updateSettings', {
        webWidget: {
          answerBot: {
            suppress: true
          },
          chat: {
            departments: {
              select: departments
            }
          },
          helpCenter: {
            suppress: true
          },
          launcher: {
            chatLabel: {
              '*': 'Fale com a gente'
            },
            mobile: {
              labelVisible: true
            }
          }
        }
      });
      zE('webWidget', 'setLocale', 'pt-br');
      zE('webWidget', 'identify', {
        name: HelpCenter.user.name,
        email: HelpCenter.user.email,
        organization: HelpCenter.user.organizations[0].name
      });
      zE('webWidget', 'open');

    }

    function fecharContato(manterAberto) {
      if (manterAberto != 'links-info-rendimento') {
        $("#links-info-rendimento").hide();
        $("#btn-informe-rendimento").css("background-color", "");
        $("#btn-informe-rendimento").css("color", "#00D1DF");
      }
      if (manterAberto != 'links-info-notas') {
        $("#links-info-notas").hide();
        $("#btn-notas").css("background-color", "");
        $("#btn-notas").css("color", "#00D1DF");
      }
      if (manterAberto != 'links-info-imposto') {
        $("#links-info-imposto").hide();
        $("#btn-imposto").css("background-color", "");
        $("#btn-imposto").css("color", "#00D1DF");
      }
      if (manterAberto != 'links-info-prolabore') {
        $("#links-info-prolabore").hide();
        $("#btn-prolabore").css("background-color", "");
        $("#btn-prolabore").css("color", "#00D1DF");
      }
      if (manterAberto != 'links-info-documentacao') {
        $("#links-info-documentacao").hide();
        $("#btn-documentacao").css("background-color", "");
        $("#btn-documentacao").css("color", "#00D1DF");
      }

      if (manterAberto != 'links-info-mensalidade') {
        $("#links-info-mensalidade").hide();
        $("#btn-mensalidade").css("background-color", "");
        $("#btn-mensalidade").css("color", "#00D1DF");
      }
      if (manterAberto != 'links-info-adicionais') {
        $("#links-info-adicionais").hide();
        $("#btn-adicionais").css("background-color", "");
        $("#btn-adicionais").css("color", "#00D1DF");
      }
      if (manterAberto != 'links-info-alteracao-baixa') {
        $("#links-info-alteracao-baixa").hide();
        $("#btn-alteracao-baixa").css("background-color", "");
        $("#btn-alteracao-baixa").css("color", "#00D1DF");
      }
      if (manterAberto != 'links-info-folha') {
        $("#links-info-folha").hide();
        $("#btn-folha").css("background-color", "");
        $("#btn-folha").css("color", "#00D1DF");
      }
      if (manterAberto != 'links-info-outros-assuntos') {
        $("#links-info-outros-assuntos").hide();
        $("#btn-outros-assuntos").css("background-color", "");
        $("#btn-outros-assuntos").css("color", "#00D1DF");
      }
    }

    // BOTÕES
    $("#btn-informe-rendimento").click(function () {
      fecharContato('links-info-rendimento');
      $("#btn-informe-rendimento").css("background-color", "#00D1DF");
      $("#btn-informe-rendimento").css("color", "#FFFFFF");
      $("#links-info-rendimento").show("fast");
    });

    $("#btn-notas").click(function () {
      fecharContato('links-info-notas');
      $("#btn-notas").css("background-color", "#00D1DF");
      $("#btn-notas").css("color", "#FFFFFF");
      $("#links-info-notas").show("fast");
    });

    $("#btn-imposto").click(function () {
      fecharContato('links-info-imposto');
      $("#btn-imposto").css("background-color", "#00D1DF");
      $("#btn-imposto").css("color", "#FFFFFF");
      $("#links-info-imposto").show("fast");
    });

    $("#btn-prolabore").click(function () {
      fecharContato('links-info-prolabore');
      $("#btn-prolabore").css("background-color", "#00D1DF");
      $("#btn-prolabore").css("color", "#FFFFFF");
      $("#links-info-prolabore").show("fast");
    });

    $("#btn-documentacao").click(function () {
      fecharContato('links-info-documentacao');
      $("#btn-documentacao").css("background-color", "#00D1DF");
      $("#btn-documentacao").css("color", "#FFFFFF");
      $("#links-info-documentacao").show("fast");
    });

    $("#btn-mensalidade").click(function () {
      fecharContato('links-info-mensalidade');
      $("#btn-mensalidade").css("background-color", "#00D1DF");
      $("#btn-mensalidade").css("color", "#FFFFFF");
      $("#links-info-mensalidade").show("fast");
    });

    $("#btn-adicionais").click(function () {
      fecharContato('links-info-adicionais');
      $("#btn-adicionais").css("background-color", "#00D1DF");
      $("#btn-adicionais").css("color", "#FFFFFF");
      $("#links-info-adicionais").show("fast");
    });

    $("#btn-alteracao-baixa").click(function () {
      fecharContato('links-info-alteracao-baixa');
      $("#btn-alteracao-baixa").css("background-color", "#00D1DF");
      $("#btn-alteracao-baixa").css("color", "#FFFFFF");
      $("#links-info-alteracao-baixa").show("fast");
    });

    $("#btn-folha").click(function () {
      fecharContato('links-info-folha');
      $("#btn-folha").css("background-color", "#00D1DF");
      $("#btn-folha").css("color", "#FFFFFF");
      $("#links-info-folha").show("fast");
    });

    $("#btn-outros-assuntos").click(function () {
      fecharContato('links-info-outros-assuntos');
      $("#btn-outros-assuntos").css("background-color", "#00D1DF");
      $("#btn-outros-assuntos").css("color", "#FFFFFF");
      $("#links-info-outros-assuntos").show("fast");
    });


    //CHAT 
    $("#chat-rendimento").click(function () {
      var zendesk = {
        departments: 'Engajamento N1',
        tags: ['guide_home', 'guide_home_movimentacoes_bancarias']
      }

      handleChat({ zendesk });
    });
    $("#chat-notas").click(function () {
      var zendesk = {
        departments: 'Engajamento N1',
        tags: ['guide_home', 'guide_home_notas_fiscais']
      }

      handleChat({ zendesk });
    });
    $("#chat-imposto").click(function () {
      var zendesk = {
        departments: 'Engajamento N1',
        tags: ['guide_home', 'guide_home_impostos']
      }

      handleChat({ zendesk });
    });
    $("#chat-prolabore").click(function () {
      var zendesk = {
        departments: 'Engajamento N1',
        tags: ['guide_home', 'guide_home_pro-labore']
      }

      handleChat({ zendesk });
    });
    $("#chat-documentacao").click(function () {
      var zendesk = {
        departments: 'Engajamento N1',
        tags: ['guide_home', 'guide_home_documentação']
      }

      handleChat({ zendesk });
    });

    $("#chat-mensalidade").click(function () {
      var zendesk = {
        departments: 'Engajamento N1',
        tags: ['guide_home', 'guide_home_mensalidade']
      }

      handleChat({ zendesk });
    });
    $("#chat-adicionais").click(function () {
      var zendesk = {
        departments: 'Engajamento N1',
        tags: ['guide_home', 'guide_home_serviços_avulsos']
      }

      handleChat({ zendesk });
    });
    $("#chat-alteracao-baixa").click(function () {
      var zendesk = {
        departments: 'Engajamento N1',
        tags: ['guide_home', 'guide_home_serviços_avulsos', 'guide_home_alteraçãoebaixa']
      }

      handleChat({ zendesk });
    });
    $("#chat-folha").click(function () {
      initZendeskChat('folha');
      zE('webWidget', 'chat:addTags', ['chat_chamado_folha_pagamentos_cliente']);
      console.log('Folha');
    });
    $("#chat-outros-assuntos").click(function () {
      var zendesk = {
        departments: 'Engajamento N1',
        tags: ['guide_home', 'guide_home_outros']
      }

      handleChat({ zendesk });
    });

    // MODAL
    $(".blocks-item-link.whats-acesso").click(function () {
      if (statusOrganization && printWhats) {
        $("#acessoWhats").modal("show");
      } else {
        $("#semAcessoWhats").modal("show");
      }
    });

    $(".blocks-item-link.fone-acesso").click(function () {
      if (statusOrganization && printFone) {
        $("#acessoFone").modal("show");
      } else {
        $("#semAcessoFone").modal("show");
      }
    });

    // LOG	
    //console.log(HelpCenter.user.organizations[0].tags);
    // console.log("printFone: " + printFone);
    //console.log("printWhats: " + printWhats);


    //console.log("statusOrganization: " + statusOrganization);



  });
});
