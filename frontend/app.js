/**
 * ResearchMate - Your AI Research Assistant
 * Client Logic cho giao diện 3 cột phong cách Sáng (Light Theme) hiện đại
 */

(function () {
  'use strict';

  // --- Multi-language (i18n) Dictionary ---
  const TRANSLATIONS = {
    vi: {
      nav_chat: "Đoạn Chat",
      nav_kb: "Kho Tri Thức",
      nav_projects: "Dự Án",
      nav_dashboard: "Bảng Điều Khiển",
      nav_settings: "Cài Đặt",
      recent_chats_title: "CÁC ĐOẠN CHAT GẦN ĐÂY",
      new_chat_btn: "Đoạn chat mới",
      chat_title: "Chat",
      welcome_title: "Trợ lý Nghiên cứu Khoa học RAG",
      welcome_sub: "Tra cứu tài liệu độ chính xác cao bằng Vector Embeddings & LLM Qwen3-4B",
      input_placeholder: "Nhập câu hỏi nghiên cứu, đối chiếu tài liệu...",
      send_btn: "Gửi",
      tab_sources: "Tài liệu liên quan",
      tab_info: "Thông tin & Colab GPU",
      kb_for_chat: "KB CHO ĐOẠN CHAT NÀY",
      kb_for_chat_sub: "Chọn tài liệu cho phép AI tra cứu trong đoạn chat hiện tại:",
      select_all: "Tất cả",
      clear_all: "Bỏ chọn",
      btn_upload_chat: "+ Nạp tệp cho chat",
      cited_sources: "TÀI LIỆU TRÍCH DẪN THỰC TẾ",
      empty_sources: "Chưa có trích dẫn nào.\nHãy đặt câu hỏi để AI đối chiếu nguồn từ Kho Tri Thức.",
      system_status: "Trạng thái hệ thống",
      kb_view_title: "Kho Tri Thức",
      kb_view_sub: "Quản lý kho tri thức, tài liệu học tập và nghiên cứu (data/raw/)",
      btn_reindex: "Lập chỉ mục lại (Re-index)",
      btn_upload_new: "+ Thêm tài liệu",
      btn_create_folder: "+ Tạo thư mục",
      kb_search_placeholder: "Tìm kiếm tài liệu theo tên...",
      filter_all: "Tất cả",
      filter_folders_all: "📂 Tất cả thư mục",
      th_doc_name: "Tên tài liệu",
      th_folder: "Thư mục",
      th_type: "Loại",
      th_size: "Dung lượng",
      th_date: "Ngày thêm",
      th_status: "Trạng thái",
      th_actions: "Thao tác",
      status_indexed: "Đã nạp Vector",
      settings_title: "Cài đặt",
      settings_desc: "Tinh chỉnh mô hình AI, thông số RAG và giao diện hệ thống",
      settings_modal_title: "Cài Đặt Hệ Thống",
      settings_group_ai: "Mô hình AI",
      settings_group_rag: "Tham số RAG (Baseline Config)",
      settings_group_ui: "Giao diện & Ngôn ngữ",
      settings_group_lang: "Ngôn ngữ & Phản hồi AI",
      label_default_model: "Model mặc định:",
      label_theme: "Chế độ hiển thị:",
      theme_light: "Sáng",
      theme_dark: "Tối",
      label_ui_lang: "Ngôn ngữ giao diện (UI Language):",
      desc_ui_lang: "Ngôn ngữ hiển thị toàn bộ nút bấm, bảng và thanh công cụ",
      label_ai_lang: "Ngôn ngữ phản hồi của AI (AI Response):",
      desc_ai_lang: "Quy định ngôn ngữ mà mô hình Qwen3-4B sẽ trả lời bạn",
      label_top_k: "Số đoạn trích dẫn (Top-K Chunks):",
      desc_top_k: "Số lượng đoạn văn bản liên quan nhất cung cấp cho LLM",
      label_threshold: "Ngưỡng tương đồng (Similarity Threshold):",
      desc_threshold: "Chỉ giữ các đoạn có Cosine Similarity lớn hơn ngưỡng này",
      label_temperature: "Nhiệt độ sinh từ (Temperature):",
      desc_temperature: "0.0 - 0.2 là chuẩn vàng triệt tiêu hoàn toàn ảo giác (hallucination)",
      btn_back_to_chat: "Quay lại Chat",
      btn_save_close: "Lưu & Đóng",
      btn_open_full_settings: "Xem toàn màn hình"
    },
    en: {
      nav_chat: "Chat",
      nav_kb: "Knowledge Base",
      nav_projects: "Projects",
      nav_dashboard: "Dashboard",
      nav_settings: "Settings",
      recent_chats_title: "RECENT CHATS",
      new_chat_btn: "New Chat",
      chat_title: "Chat",
      welcome_title: "RAG Scientific Research Assistant",
      welcome_sub: "High-precision document retrieval using Vector Embeddings & Qwen3-4B LLM",
      input_placeholder: "Ask research questions, verify documents...",
      send_btn: "Send",
      tab_sources: "Relevant Sources",
      tab_info: "Info & Colab GPU",
      kb_for_chat: "KB FOR THIS CHAT",
      kb_for_chat_sub: "Select documents allowed for AI retrieval in this chat session:",
      select_all: "Select All",
      clear_all: "Deselect",
      btn_upload_chat: "+ Upload for chat",
      cited_sources: "ACTUAL CITED SOURCES",
      empty_sources: "No citations yet.\nAsk a question to cross-examine Knowledge Base sources.",
      system_status: "System Status",
      kb_view_title: "Knowledge Base",
      kb_view_sub: "Manage knowledge repositories, academic papers & datasets (data/raw/)",
      btn_reindex: "Re-index Store",
      btn_upload_new: "+ Add Document",
      btn_create_folder: "+ New Folder",
      kb_search_placeholder: "Search documents by name...",
      filter_all: "All",
      filter_folders_all: "📂 All Folders",
      th_doc_name: "Document Name",
      th_folder: "Folder",
      th_type: "Type",
      th_size: "Size",
      th_date: "Date Added",
      th_status: "Status",
      th_actions: "Actions",
      status_indexed: "Vector Indexed",
      settings_title: "Settings",
      settings_desc: "Configure AI models, RAG parameters and system interface",
      settings_modal_title: "System Settings",
      settings_group_ai: "AI Model",
      settings_group_rag: "RAG Parameters (Baseline Config)",
      settings_group_ui: "Interface & Language",
      settings_group_lang: "Language & AI Response",
      label_default_model: "Default Model:",
      label_theme: "Display Theme:",
      theme_light: "Light",
      theme_dark: "Dark",
      label_ui_lang: "UI Language:",
      desc_ui_lang: "Display language for buttons, panels and navigation",
      label_ai_lang: "AI Response Language:",
      desc_ai_lang: "Directs the language Qwen3-4B will use to reply to you",
      label_top_k: "Retrieved Chunks (Top-K):",
      desc_top_k: "Number of most relevant context chunks supplied to LLM",
      label_threshold: "Similarity Threshold:",
      desc_threshold: "Retain only chunks with Cosine Similarity above this cutoff",
      label_temperature: "Temperature:",
      desc_temperature: "0.0 - 0.2 is the gold standard eliminating hallucination",
      btn_back_to_chat: "Back to Chat",
      btn_save_close: "Save & Close",
      btn_open_full_settings: "View Fullscreen"
    }
  };

  // --- App State ---
  const state = {
    colabUrl: localStorage.getItem('colab_url') || 'https://6a000f9cfeae6b5ad6.gradio.live',
    backendType: 'gradio',
    token: 'auth-session-active',
    selectedModel: localStorage.getItem('selected_model') || 'qwen3-4b',
    uiLanguage: localStorage.getItem('ui_language') || 'vi',
    aiResponseLanguage: localStorage.getItem('ai_response_language') || 'vi',
    availableDocs: [],
    folders: ['Chung'],
    selectedFolderFilter: 'all',
    expandedChatKbFolders: new Set(),
    activeChatId: 'chat-default',
    chatSessions: {},
    sidebarCollapsed: localStorage.getItem('sidebar_collapsed') === 'true',
    movingFile: null,
    useRag: true,
    topK: 3,
    similarityThreshold: 0.40,
    temperature: 0.20,
    searchScope: 'all',
    currentSources: [],
    recentChats: [],
    projects: [],
    activityLog: [],
    selectedAttachedFile: null,
    loadingTimerInterval: null,
    loadingStartTime: 0
  };

  // --- DOM Elements ---
  const elements = {
    // Navigation items
    navItems: document.querySelectorAll('.nav-item'),
    viewPanels: document.querySelectorAll('.view-panel'),

    // Chat controls
    chatMessagesContainer: document.getElementById('chat-messages-container'),
    chatWelcomeContainer: document.getElementById('chat-welcome-container'),
    welcomePromptChips: document.getElementById('welcome-prompt-chips'),
    selectModel: document.getElementById('select-model'),
    checkEnableRag: document.getElementById('check-enable-rag'),
    btnThemeToggle: document.getElementById('btn-theme-toggle'),
    themeToggleIcon: document.getElementById('theme-toggle-icon'),
    btnFullscreenToggle: document.getElementById('btn-fullscreen-toggle'),
    btnToggleRightPanel: document.getElementById('btn-toggle-right-panel'),
    btnReconnectSwitch: document.getElementById('btn-reconnect-switch'),
    btnColabStatusBadge: document.getElementById('btn-colab-status-badge'),
    topbarColabDot: document.getElementById('topbar-colab-dot'),
    topbarColabText: document.getElementById('topbar-colab-text'),
    chatStatusText: document.getElementById('chat-status-text'),
    chatLoadingBox: document.getElementById('chat-loading-box'),
    loadingStepText: document.getElementById('loading-step-text'),
    loadingTimer: document.getElementById('loading-timer'),

    // Input area
    promptInput: document.getElementById('prompt-input'),
    btnSubmitTask: document.getElementById('btn-submit-task'),
    btnTriggerAttachment: document.getElementById('btn-trigger-attachment'),
    fileAttachmentInput: document.getElementById('file-attachment-input'),
    attachedFilePill: document.getElementById('attached-file-pill'),
    attachedFileName: document.getElementById('attached-file-name'),
    btnRemoveAttachedFile: document.getElementById('btn-remove-attached-file'),
    btnChooseScope: document.getElementById('btn-choose-scope'),

    // Actions on AI message
    btnCopyResult: document.getElementById('btn-copy-result'),
    btnFeedbackLike: document.getElementById('btn-feedback-like'),
    btnFeedbackDislike: document.getElementById('btn-feedback-dislike'),
    btnDownloadMd: document.getElementById('btn-download-md'),

    // Right Inspector Panel
    sidebarRight: document.getElementById('sidebar-right'),
    sidebarResizer: document.getElementById('sidebar-resizer'),
    btnToggleSidebar: document.getElementById('btn-toggle-sidebar'),
    btnFloatingExpandSidebar: document.getElementById('btn-floating-expand-sidebar'),
    tabRelDocs: document.getElementById('tab-rel-docs'),
    tabSysInfo: document.getElementById('tab-sys-info'),
    paneSources: document.getElementById('pane-sources'),
    paneInfo: document.getElementById('pane-info'),
    chatKbScopeCard: document.getElementById('chat-kb-scope-card'),
    chatKbCardHeader: document.getElementById('chat-kb-card-header'),
    chatKbCardBody: document.getElementById('chat-kb-card-body'),
    chatKbChevron: document.getElementById('chat-kb-chevron'),
    chatKbSelectedCount: document.getElementById('chat-kb-selected-count'),
    btnChatKbSelectAll: document.getElementById('btn-chat-kb-select-all'),
    btnChatKbClearAll: document.getElementById('btn-chat-kb-clear-all'),
    btnUploadToChat: document.getElementById('btn-upload-to-chat'),
    chatKbFileInput: document.getElementById('chat-kb-file-input'),
    chatKbDocsList: document.getElementById('chat-kb-docs-list'),
    rightPanelSourcesCount: document.getElementById('right-panel-sources-count'),
    rightPanelSourcesList: document.getElementById('right-panel-sources-list'),
    inspectorModelName: document.getElementById('inspector-model-name'),
    inspectorEmbedName: document.getElementById('inspector-embed-name'),
    inspectorVectordbName: document.getElementById('inspector-vectordb-name'),
    inspectorKbCount: document.getElementById('inspector-kb-count'),
    inspectorColabDot: document.getElementById('inspector-colab-dot'),
    inspectorColabStatus: document.getElementById('inspector-colab-status'),
    inspectorVectorStatus: document.getElementById('inspector-vector-status'),

    // Colab Panel Controls (inside pane-info)
    panelColabUrl: document.getElementById('panel-colab-url'),
    panelColabUser: document.getElementById('panel-colab-user'),
    panelColabPass: document.getElementById('panel-colab-pass'),
    btnPanelColabConnect: document.getElementById('btn-panel-colab-connect'),
    btnPanelColabMock: document.getElementById('btn-panel-colab-mock'),
    panelColabBanner: document.getElementById('panel-colab-banner'),
    panelColabBannerText: document.getElementById('panel-colab-banner-text'),

    // Knowledge Base View
    kbFullTableBody: document.getElementById('kb-full-table-body'),
    btnUploadNewDoc: document.getElementById('btn-upload-new-doc'),
    kbViewUploadInput: document.getElementById('kb-view-upload-input'),
    btnReindexKbView: document.getElementById('btn-reindex-kb-view'),
    btnCreateFolderModal: document.getElementById('btn-create-folder-modal'),
    createFolderModal: document.getElementById('create-folder-modal'),
    createFolderForm: document.getElementById('create-folder-form'),
    inputNewFolderName: document.getElementById('input-new-folder-name'),
    btnCloseFolderModal: document.getElementById('btn-close-folder-modal'),
    btnCancelFolderModal: document.getElementById('btn-cancel-folder-modal'),
    kbFolderFilter: document.getElementById('kb-folder-filter'),
    moveFileModal: document.getElementById('move-file-modal'),
    moveFileForm: document.getElementById('move-file-form'),
    moveFileTargetName: document.getElementById('move-file-target-name'),
    selectMoveTargetFolder: document.getElementById('select-move-target-folder'),
    btnCloseMoveModal: document.getElementById('btn-close-move-modal'),
    btnCancelMoveModal: document.getElementById('btn-cancel-move-modal'),
    kbSearchBox: document.getElementById('kb-search-box'),
    kbFilterTabs: document.querySelectorAll('.filter-tab'),
    kbCountAll: document.getElementById('kb-count-all'),
    kbCountPdf: document.getElementById('kb-count-pdf'),
    kbCountDocx: document.getElementById('kb-count-docx'),
    kbCountTxt: document.getElementById('kb-count-txt'),
    kbCountMd: document.getElementById('kb-count-md'),
    kbFoldersSection: document.getElementById('kb-folders-section'),
    kbFoldersGrid: document.getElementById('kb-folders-grid'),
    kbFoldersCount: document.getElementById('kb-folders-count'),
    btnQuickNewFolder: document.getElementById('btn-quick-new-folder'),
    sidebarKbCount: document.getElementById('sidebar-kb-count'),
    kpiTotalDocs: document.getElementById('kpi-total-docs'),
    kpiTotalSize: document.getElementById('kpi-total-size'),
    kpiTotalChunks: document.getElementById('kpi-total-chunks'),
    kpiTotalChats: document.getElementById('kpi-total-chats'),
    dashModelName: document.getElementById('dash-model-name'),
    dashConnectionStatus: document.getElementById('dash-connection-status'),
    dashActivityList: document.getElementById('dash-activity-list'),
    dashActivityCount: document.getElementById('dash-activity-count'),

    // Upload Progress Modal
    uploadProgressModal: document.getElementById('upload-progress-modal'),
    uploadProgressFilename: document.getElementById('upload-progress-filename'),
    uploadProgressSub: document.getElementById('upload-progress-sub'),
    uploadProgressPct: document.getElementById('upload-progress-pct'),
    uploadProgressFill: document.getElementById('upload-progress-fill'),
    stepUpload: document.getElementById('step-upload'),
    stepExtract: document.getElementById('step-extract'),
    stepEmbed: document.getElementById('step-embed'),
    stepDone: document.getElementById('step-done'),

    // Projects View
    projectsGridContainer: document.getElementById('projects-grid-container'),
    btnCreateProject: document.getElementById('btn-create-project'),
    createProjectModal: document.getElementById('create-project-modal'),
    btnCloseProjectModal: document.getElementById('btn-close-project-modal'),
    btnCancelProjectModal: document.getElementById('btn-cancel-project-modal'),
    createProjectForm: document.getElementById('create-project-form'),
    inputNewProjectTitle: document.getElementById('input-new-project-title'),
    inputNewProjectDesc: document.getElementById('input-new-project-desc'),
    selectNewProjectIcon: document.getElementById('select-new-project-icon'),

    // Settings & Language
    topKButtons: document.querySelectorAll('.btn-chunk-k'),
    sliderThreshold: document.getElementById('slider-threshold'),
    labelThresholdVal: document.getElementById('label-threshold-val'),
    sliderTemperature: document.getElementById('slider-temperature'),
    labelTemperatureVal: document.getElementById('label-temperature-val'),
    btnSetLightTheme: document.getElementById('btn-set-light-theme'),
    btnSetDarkTheme: document.getElementById('btn-set-dark-theme'),
    selectUiLanguage: document.getElementById('select-ui-language'),
    selectAiResponseLanguage: document.getElementById('select-ai-response-language'),
    btnQuickAiLang: document.getElementById('btn-quick-ai-lang'),
    labelQuickAiLang: document.getElementById('label-quick-ai-lang'),
    btnHeaderSettings: document.getElementById('btn-header-settings'),
    btnBackToChat: document.getElementById('btn-back-to-chat'),
    btnOpenSettingsShortcut: document.getElementById('btn-open-settings-shortcut'),

    // Quick Settings Modal
    settingsModal: document.getElementById('settings-modal'),
    btnCloseSettingsModal: document.getElementById('btn-close-settings-modal'),
    btnSaveSettingsModal: document.getElementById('btn-save-settings-modal'),
    btnFullSettingsView: document.getElementById('btn-full-settings-view'),
    modalSelectUiLanguage: document.getElementById('modal-select-ui-language'),
    modalSelectAiLanguage: document.getElementById('modal-select-ai-language'),
    modalBtnLightTheme: document.getElementById('modal-btn-light-theme'),
    modalBtnDarkTheme: document.getElementById('modal-btn-dark-theme'),
    modalBtnChunkK: document.querySelectorAll('.modal-btn-chunk-k'),
    modalSliderThreshold: document.getElementById('modal-slider-threshold'),
    modalLabelThresholdVal: document.getElementById('modal-label-threshold-val'),
    modalSliderTemperature: document.getElementById('modal-slider-temperature'),
    modalLabelTemperatureVal: document.getElementById('modal-label-temperature-val'),

    // Citation Modal
    citationPreviewModal: document.getElementById('citation-preview-modal'),
    btnCloseCitationModal: document.getElementById('btn-close-citation-modal'),
    btnCloseCitationFooter: document.getElementById('btn-close-citation-footer'),
    citationModalBadge: document.getElementById('citation-modal-badge'),
    citationModalSource: document.getElementById('citation-modal-source'),
    citationModalScore: document.getElementById('citation-modal-score'),
    citationModalContent: document.getElementById('citation-modal-content'),
    btnCopyCitationText: document.getElementById('btn-copy-citation-text'),

    // Gateway Modal
    colabGatewayModal: document.getElementById('colab-gateway-modal'),
    colabLoginForm: document.getElementById('colab-login-form'),
    gatewayColabUrl: document.getElementById('gateway-colab-url'),
    gatewayColabUser: document.getElementById('gateway-colab-user'),
    gatewayColabPass: document.getElementById('gateway-colab-pass'),
    btnFillMockUrl: document.getElementById('btn-fill-mock-url'),
    btnCloseGateway: document.getElementById('btn-close-gateway'),

    // Recent chats
    recentChatsList: document.getElementById('recent-chats-list'),
    btnNewChat: document.getElementById('btn-new-chat'),
    btnUserProfile: document.getElementById('btn-user-profile'),

    toastContainer: document.getElementById('toast-container')
  };

  // --- Initializer ---
  function init() {
    initTheme();
    initLanguage();
    loadChatSessions();
    setupSidebarResizeAndCollapse();
    setupNavigation();
    setupChatEvents();
    setupChatKbEvents();
    setupRightPanelTabs();
    setupSettingsEvents();
    setupKnowledgeBase();
    setupFolderModals();
    setupProjectsEvents();
    setupColabPanelEvents();
    updateColabStatusUI();
    loadRagStatus();
    loadRecentChats();
    loadProjects();
    loadActivityLog();
  }

  // --- Language Management (i18n) & AI Response Language ---
  function initLanguage() {
    applyLanguage(state.uiLanguage);
    setAiResponseLanguage(state.aiResponseLanguage, false);
  }

  function applyLanguage(lang) {
    if (!TRANSLATIONS[lang]) lang = 'vi';
    state.uiLanguage = lang;
    localStorage.setItem('ui_language', lang);

    const t = TRANSLATIONS[lang];

    // 1. Translate all data-i18n elements
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (t[key] !== undefined) {
        el.textContent = t[key];
      }
    });

    // 2. Translate specific placeholders and inputs
    if (elements.promptInput) {
      elements.promptInput.placeholder = t.input_placeholder;
    }
    if (elements.kbSearchBox) {
      elements.kbSearchBox.placeholder = t.kb_search_placeholder;
    }

    // 3. Sync UI Language dropdowns
    if (elements.selectUiLanguage) elements.selectUiLanguage.value = lang;
    if (elements.modalSelectUiLanguage) elements.modalSelectUiLanguage.value = lang;

    // 4. Update dynamic empty sources if present
    const emptyState = document.getElementById('empty-sources-state');
    if (emptyState && (!state.currentSources || state.currentSources.length === 0)) {
      const p = emptyState.querySelector('p');
      if (p) p.innerHTML = t.empty_sources.replace('\n', '<br>');
    }
  }

  function setAiResponseLanguage(lang, showNotification = true) {
    if (!['vi', 'en', 'auto'].includes(lang)) lang = 'vi';
    state.aiResponseLanguage = lang;
    localStorage.setItem('ai_response_language', lang);

    if (elements.selectAiResponseLanguage) elements.selectAiResponseLanguage.value = lang;
    if (elements.modalSelectAiLanguage) elements.modalSelectAiLanguage.value = lang;

    if (elements.labelQuickAiLang) {
      elements.labelQuickAiLang.textContent = `AI: ${lang.toUpperCase()}`;
    }

    if (showNotification) {
      const msg = lang === 'en' 
        ? 'AI sẽ trả lời bằng English' 
        : (lang === 'auto' ? 'AI sẽ tự động nhận diện ngôn ngữ câu hỏi' : 'AI sẽ trả lời bằng Tiếng Việt');
      showToast(msg, 'success');
    }
  }

  // --- Quick Settings Modal Logic ---
  function openSettingsModal() {
    if (!elements.settingsModal) return;
    elements.settingsModal.style.display = 'flex';

    // Sync values into modal
    if (elements.modalSelectUiLanguage) elements.modalSelectUiLanguage.value = state.uiLanguage;
    if (elements.modalSelectAiLanguage) elements.modalSelectAiLanguage.value = state.aiResponseLanguage;

    // Sync Top-K
    if (elements.modalBtnChunkK) {
      elements.modalBtnChunkK.forEach(b => {
        b.classList.toggle('active', parseInt(b.getAttribute('data-k'), 10) === state.topK);
      });
    }

    // Sync Threshold
    if (elements.modalSliderThreshold) {
      elements.modalSliderThreshold.value = state.similarityThreshold;
      if (elements.modalLabelThresholdVal) {
        elements.modalLabelThresholdVal.textContent = state.similarityThreshold.toFixed(2);
      }
    }

    // Sync Temperature
    if (elements.modalSliderTemperature) {
      elements.modalSliderTemperature.value = state.temperature;
      if (elements.modalLabelTemperatureVal) {
        elements.modalLabelTemperatureVal.textContent = state.temperature.toFixed(2);
      }
    }

    // Sync Theme in Modal
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    if (elements.modalBtnDarkTheme) elements.modalBtnDarkTheme.classList.toggle('active', isDark);
    if (elements.modalBtnLightTheme) elements.modalBtnLightTheme.classList.toggle('active', !isDark);
  }

  function closeSettingsModal() {
    if (elements.settingsModal) elements.settingsModal.style.display = 'none';
  }

  // --- Theme Management (Mặc định Dark Theme chuẩn ảnh chụp) ---
  function initTheme() {
    const savedTheme = localStorage.getItem('researchmate_theme') || 'dark';
    applyTheme(savedTheme);
  }

  function applyTheme(theme) {
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
      if (elements.themeToggleIcon) elements.themeToggleIcon.className = 'fa-regular fa-moon';
      if (elements.btnSetDarkTheme) elements.btnSetDarkTheme.classList.add('active');
      if (elements.btnSetLightTheme) elements.btnSetLightTheme.classList.remove('active');
      if (elements.modalBtnDarkTheme) elements.modalBtnDarkTheme.classList.add('active');
      if (elements.modalBtnLightTheme) elements.modalBtnLightTheme.classList.remove('active');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
      if (elements.themeToggleIcon) elements.themeToggleIcon.className = 'fa-solid fa-sun';
      if (elements.btnSetLightTheme) elements.btnSetLightTheme.classList.add('active');
      if (elements.btnSetDarkTheme) elements.btnSetDarkTheme.classList.remove('active');
      if (elements.modalBtnLightTheme) elements.modalBtnLightTheme.classList.add('active');
      if (elements.modalBtnDarkTheme) elements.modalBtnDarkTheme.classList.remove('active');
    }
    localStorage.setItem('researchmate_theme', theme);
  }

  function toggleTheme() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    applyTheme(isDark ? 'light' : 'dark');
  }

  // --- Navigation between Views (Chat, KB, Projects, Dashboard, Settings) ---
  function setupNavigation() {
    elements.navItems.forEach(item => {
      item.addEventListener('click', () => {
        const targetView = item.getAttribute('data-view');
        switchView(targetView);
      });
    });

    const shortcutSettings = document.getElementById('btn-open-settings-shortcut');
    if (shortcutSettings) {
      shortcutSettings.addEventListener('click', (e) => {
        e.stopPropagation();
        openSettingsModal();
      });
    }

    if (elements.btnHeaderSettings) {
      elements.btnHeaderSettings.addEventListener('click', () => {
        openSettingsModal();
      });
    }

    if (elements.btnBackToChat) {
      elements.btnBackToChat.addEventListener('click', () => {
        switchView('chat');
      });
    }
  }

  function switchView(viewName) {
    elements.navItems.forEach(item => {
      item.classList.toggle('active', item.getAttribute('data-view') === viewName);
    });

    elements.viewPanels.forEach(panel => {
      panel.classList.toggle('active', panel.id === `view-${viewName}`);
      panel.style.display = panel.id === `view-${viewName}` ? 'flex' : 'none';
    });

    if (viewName === 'knowledge') {
      loadRagStatus();
    }
    if (viewName === 'projects') {
      loadProjects();
    }
    if (viewName === 'dashboard') {
      loadRagStatus();
      renderDashboardActivity();
    }
  }

  // --- Chat & Submission Logic ---
  function setupChatEvents() {
    // Send button
    elements.btnSubmitTask.addEventListener('click', submitChatMessage);

    // Enter or Ctrl+Enter to send
    elements.promptInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        submitChatMessage();
      }
    });

    // Auto resize textarea
    elements.promptInput.addEventListener('input', () => {
      elements.promptInput.style.height = 'auto';
      elements.promptInput.style.height = Math.min(elements.promptInput.scrollHeight, 120) + 'px';
    });

    // RAG Toggle
    elements.checkEnableRag.addEventListener('change', (e) => {
      state.useRag = e.target.checked;
      showToast(state.useRag ? 'Đã bật RAG Vector Search' : 'Đã tắt RAG (Chat thuần LLM)', 'info');
    });

    // Theme toggle icon in header
    elements.btnThemeToggle.addEventListener('click', toggleTheme);

    // Reconnect / Gateway Modal
    if (elements.btnReconnectSwitch) {
      elements.btnReconnectSwitch.addEventListener('click', () => {
        if (elements.colabGatewayModal) elements.colabGatewayModal.style.display = 'flex';
      });
    }
    if (elements.btnColabStatusBadge) {
      elements.btnColabStatusBadge.addEventListener('click', () => {
        if (elements.colabGatewayModal) elements.colabGatewayModal.style.display = 'flex';
      });
    }
    if (elements.btnCloseGateway) {
      elements.btnCloseGateway.addEventListener('click', () => {
        if (elements.colabGatewayModal) elements.colabGatewayModal.style.display = 'none';
      });
    }
    if (elements.btnFillMockUrl) {
      elements.btnFillMockUrl.addEventListener('click', () => {
        if (elements.gatewayColabUrl) elements.gatewayColabUrl.value = 'http://localhost:8080/api/mock-colab';
        if (elements.gatewayColabUser) elements.gatewayColabUser.value = 'admin';
        if (elements.gatewayColabPass) elements.gatewayColabPass.value = 'colab2026';
      });
    }
    if (elements.colabLoginForm) {
      elements.colabLoginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const url = (elements.gatewayColabUrl?.value || '').trim();
        const user = (elements.gatewayColabUser?.value || '').trim();
        const pass = (elements.gatewayColabPass?.value || '').trim();
        await testAndConnectColab(url, user, pass);
        if (elements.colabGatewayModal) elements.colabGatewayModal.style.display = 'none';
      });
    }

    // Welcome Prompt Chips
    if (elements.welcomePromptChips) {
      elements.welcomePromptChips.addEventListener('click', (e) => {
        const chip = e.target.closest('.prompt-chip');
        if (chip) {
          const prompt = chip.getAttribute('data-prompt');
          if (prompt) {
            elements.promptInput.value = prompt;
            submitChatMessage();
          }
        }
      });
    }

    // File attachment
    if (elements.btnTriggerAttachment && elements.fileAttachmentInput) {
      elements.btnTriggerAttachment.addEventListener('click', () => {
        elements.fileAttachmentInput.click();
      });

      elements.fileAttachmentInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
          handleFileAttachment(e.target.files[0]);
        }
      });
    }

    if (elements.btnRemoveAttachedFile) {
      elements.btnRemoveAttachedFile.addEventListener('click', () => {
        state.selectedAttachedFile = null;
        if (elements.fileAttachmentInput) elements.fileAttachmentInput.value = '';
        if (elements.attachedFilePill) elements.attachedFilePill.style.display = 'none';
      });
    }

    // Scope button
    if (elements.btnChooseScope) {
      elements.btnChooseScope.addEventListener('click', () => {
        switchView('knowledge');
      });
    }

    // Message action buttons (Copy, Like, Dislike, Download)
    if (elements.btnCopyResult) elements.btnCopyResult.addEventListener('click', copyLastAIResponse);
    if (elements.btnFeedbackLike) elements.btnFeedbackLike.addEventListener('click', () => handleFeedback('like'));
    if (elements.btnFeedbackDislike) elements.btnFeedbackDislike.addEventListener('click', () => handleFeedback('dislike'));
    if (elements.btnDownloadMd) elements.btnDownloadMd.addEventListener('click', downloadMarkdownFile);

    // Click reference pills in existing messages
    const pillsList = document.getElementById('chat-ref-pills-list');
    if (pillsList) {
      pillsList.addEventListener('click', (e) => {
        const btn = e.target.closest('.ref-pill-btn');
        if (btn) {
          const chunkId = parseInt(btn.getAttribute('data-chunk'), 10);
          showCitationModal({
            chunk_id: chunkId,
            source: btn.innerText.trim(),
            score: 0.85,
            text: `Đây là đoạn trích dẫn được lưu trữ trong Vector Store của tài liệu [${btn.innerText.trim()}]. Mô hình RAG đã xác định đoạn này đạt điểm tương đồng ngữ nghĩa cao nhất để đưa vào ngữ cảnh cho Qwen suy luận.`
          });
        }
      });
    }

    // Model Selector Dropdown
    if (elements.selectModel) {
      elements.selectModel.value = state.selectedModel;
      syncModelDisplay(state.selectedModel);

      elements.selectModel.addEventListener('change', (e) => {
        const val = e.target.value;
        if (val === 'colab-custom') {
          switchRightTab('info');
          if (elements.colabGatewayModal) {
            elements.colabGatewayModal.style.display = 'flex';
          }
          showToast('Vui lòng nhập URL Google Colab tùy chỉnh trong bảng cấu hình', 'info');
        } else {
          state.selectedModel = val;
          localStorage.setItem('selected_model', val);
          syncModelDisplay(val);
          showToast('Đã chọn mô hình: Qwen3-4B (Google Colab GPU T4)', 'success');
        }
      });
    }

    // New chat button (Tạo cuộc hội thoại mới với Knowledge Base riêng)
    if (elements.btnNewChat) {
      elements.btnNewChat.addEventListener('click', () => {
        const bubbles = elements.chatMessagesContainer.querySelectorAll('.chat-bubble-row');
        bubbles.forEach(b => b.remove());
        if (elements.chatWelcomeContainer) {
          elements.chatWelcomeContainer.style.display = 'flex';
        }
        updateRightPanelSources([]);
        
        const newChatId = `chat-${Date.now()}`;
        state.activeChatId = newChatId;
        state.chatSessions[newChatId] = {
          id: newChatId,
          title: 'Cuộc trò chuyện mới',
          allowedDocs: ['all']
        };
        saveChatSessions();
        renderChatKbDocsList();
        
        showToast('Đã bắt đầu cuộc hội thoại mới! (Knowledge Base riêng biệt)', 'info');
        elements.promptInput.focus();
      });
    }
  }

  function handleFileAttachment(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      state.selectedAttachedFile = {
        name: file.name,
        size: file.size,
        base64: e.target.result
      };
      elements.attachedFileName.textContent = file.name;
      elements.attachedFilePill.style.display = 'inline-flex';
      showToast(`Đã đính kèm: ${file.name}`, 'info');
    };
    reader.readAsDataURL(file);
  }

  // --- Submit Message & Call Backend ---
  async function submitChatMessage() {
    const prompt = elements.promptInput.value.trim();
    if (!prompt && !state.selectedAttachedFile) {
      return;
    }

    // Hide welcome state
    if (elements.chatWelcomeContainer) {
      elements.chatWelcomeContainer.style.display = 'none';
    }

    // 1. Append User Message Bubble
    appendUserBubble(prompt || `Phân tích tệp ${state.selectedAttachedFile.name}`);
    elements.promptInput.value = '';
    elements.promptInput.style.height = 'auto';

    // 2. Start Loading
    startChatLoading();

    // 3. Prepare Payload
    const currentBackendType = (state.colabUrl && state.colabUrl.includes('gradio')) ? 'gradio' : (state.colabUrl.includes('mock') ? 'mock' : 'fastapi');
    const activeAllowedDocs = getActiveChatAllowedDocs();
    const payload = {
      colab_url: state.colabUrl,
      backend_type: currentBackendType,
      token: state.token,
      model: state.selectedModel,
      allowed_docs: activeAllowedDocs,
      prompt: prompt || 'Tóm tắt nội dung tài liệu này',
      use_rag: state.useRag,
      top_k: state.topK,
      similarity_threshold: state.similarityThreshold,
      temperature: state.temperature,
      search_scope: state.selectedAttachedFile ? 'file' : 'all',
      ai_response_language: state.aiResponseLanguage || 'vi',
      file_name: state.selectedAttachedFile ? state.selectedAttachedFile.name : '',
      file_base64: state.selectedAttachedFile ? state.selectedAttachedFile.base64 : '',
      username: localStorage.getItem('colab_user') || 'triet',
      password: localStorage.getItem('colab_pass') || 'QwenFedora7392!'
    };

    try {
      const response = await fetch('/api/colab/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || data.error || 'Lỗi xử lý từ máy chủ');
      }

      // 4. Append AI Response Bubble
      appendAIBubble(data);

      // 5. Update Right Panel Sources List
      updateRightPanelSources(data.rag_sources || []);

      // 6. Reset attachment
      if (state.selectedAttachedFile) {
        state.selectedAttachedFile = null;
        elements.fileAttachmentInput.value = '';
        elements.attachedFilePill.style.display = 'none';
      }

      // 7. Add to recent chats
      addNewRecentChat(prompt.slice(0, 36) + (prompt.length > 36 ? '...' : ''));

      // 8. Add to activity log for Dashboard
      addActivityLog(prompt, (data.rag_sources || []).length, data.rag_sources?.[0]?.score || 0.85);

    } catch (err) {
      appendErrorBubble(err.message);
    } finally {
      stopChatLoading();
    }
  }

  function appendUserBubble(text) {
    const row = document.createElement('div');
    row.className = 'chat-bubble-row user-row';
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    row.innerHTML = `
      <div class="bubble-avatar user-avatar">T</div>
      <div class="bubble-content-box">
        <div class="bubble-text">${escapeHTML(text)}</div>
        <div class="bubble-time">
          <span>${timeStr}</span>
          <i class="fa-solid fa-check-double text-blue"></i>
        </div>
      </div>
    `;
    elements.chatMessagesContainer.insertBefore(row, elements.chatLoadingBox);
    scrollToBottom();
  }

  function appendAIBubble(data) {
    const row = document.createElement('div');
    row.className = 'chat-bubble-row ai-row';
    const sources = data.rag_sources || [];
    state.currentSources = sources;

    let rawText = data.result || '';
    let thoughtHtml = '';

    // Tách phần suy luận <think>...</think> của Qwen thành khối accordion chuyên nghiệp
    const thinkMatch = rawText.match(/<think>([\s\S]*?)<\/think>/i);
    if (thinkMatch) {
      const thoughtText = thinkMatch[1].trim();
      rawText = rawText.replace(/<think>[\s\S]*?<\/think>/i, '').trim();
      if (thoughtText) {
        thoughtHtml = `
          <details class="qwen-thought-box">
            <summary><i class="fa-solid fa-brain"></i> Quá trình suy luận của AI (Nhấn để xem)</summary>
            <div class="thought-content">${escapeHTML(thoughtText)}</div>
          </details>
        `;
      }
    }

    let parsedHtml = window.marked ? window.marked.parse(rawText) : escapeHTML(rawText);

    // Convert [1], [2] to clickable badges
    parsedHtml = parsedHtml.replace(/\[\s*([0-9]+)\s*\]/g, (m, p) => {
      return `<button type="button" class="ref-pill-btn" style="padding: 0.1rem 0.45rem; margin: 0 0.15rem; font-size: 0.72rem;" data-chunk="${p}">[${p}]</button>`;
    });

    let refPillsHtml = '';
    if (sources.length > 0) {
      refPillsHtml = `
        <div class="reference-sources-footer">
          <span class="ref-label">Nguồn tham khảo:</span>
          <div class="ref-pills-list">
            ${sources.map((s, idx) => `
              <button type="button" class="ref-pill-btn" data-chunk="${s.chunk_id || idx + 1}">
                <i class="fa-regular fa-file-pdf text-red"></i>
                <span>${escapeHTML(s.source || 'Tài liệu')} <span class="ref-page">(Khớp ${Math.round((s.score || 0.8) * 100)}%)</span></span>
              </button>
            `).join('')}
          </div>
        </div>
      `;
    }

    row.innerHTML = `
      <div class="bubble-avatar ai-avatar">
        <i class="fa-solid fa-sparkles"></i>
      </div>
      <div class="bubble-content-box">
        <div class="markdown-body">
          ${thoughtHtml}
          ${parsedHtml}
          ${refPillsHtml}
        </div>
        <div class="message-action-bar">
          <button type="button" class="msg-action-btn btn-copy-bubble" title="Sao chép nội dung">
            <i class="fa-regular fa-copy"></i>
          </button>
          <button type="button" class="msg-action-btn btn-like-bubble" title="Hữu ích">
            <i class="fa-regular fa-thumbs-up"></i>
          </button>
          <button type="button" class="msg-action-btn btn-dislike-bubble" title="Chưa chuẩn">
            <i class="fa-regular fa-thumbs-down"></i>
          </button>
        </div>
      </div>
    `;

    // Event delegation on pills
    row.addEventListener('click', (e) => {
      const pill = e.target.closest('.ref-pill-btn');
      if (pill) {
        const cId = parseInt(pill.getAttribute('data-chunk'), 10);
        const found = sources.find(s => s.chunk_id === cId) || sources[0];
        if (found) showCitationModal(found);
      }

      if (e.target.closest('.btn-copy-bubble')) {
        navigator.clipboard.writeText(data.result || '');
        showToast('Đã sao chép nội dung vào bộ nhớ tạm!', 'success');
      }

      if (e.target.closest('.btn-like-bubble')) {
        handleFeedback('like');
      }

      if (e.target.closest('.btn-dislike-bubble')) {
        handleFeedback('dislike');
      }
    });

    elements.chatMessagesContainer.insertBefore(row, elements.chatLoadingBox);
    scrollToBottom();
  }

  function appendErrorBubble(errMsg) {
    const row = document.createElement('div');
    row.className = 'chat-bubble-row ai-row';
    row.innerHTML = `
      <div class="bubble-avatar" style="background: #ef4444; color: white;">!</div>
      <div class="bubble-content-box" style="border-color: #fca5a5; background: #fff5f5;">
        <div style="color: #b91c1c; font-weight: 600;">Lỗi kết nối: ${escapeHTML(errMsg)}</div>
      </div>
    `;
    elements.chatMessagesContainer.insertBefore(row, elements.chatLoadingBox);
    scrollToBottom();
  }

  function startChatLoading() {
    elements.btnSubmitTask.disabled = true;
    elements.chatLoadingBox.style.display = 'flex';
    state.loadingStartTime = performance.now();
    elements.loadingStepText.textContent = 'Đang phân tích câu hỏi & đối chiếu Vector Store...';

    state.loadingTimerInterval = setInterval(() => {
      const elapsed = ((performance.now() - state.loadingStartTime) / 1000).toFixed(1);
      elements.loadingTimer.textContent = `${elapsed}s`;
      if (elapsed > 2.5 && elapsed < 6.0) {
        elements.loadingStepText.textContent = 'Đang truy xuất đoạn liên quan & tạo Prompt chống ảo giác...';
      } else if (elapsed >= 6.0) {
        elements.loadingStepText.textContent = 'Qwen Colab GPU đang hoàn tất câu trả lời...';
      }
    }, 100);
    scrollToBottom();
  }

  function stopChatLoading() {
    clearInterval(state.loadingTimerInterval);
    elements.btnSubmitTask.disabled = false;
    elements.chatLoadingBox.style.display = 'none';
  }

  function scrollToBottom() {
    elements.chatMessagesContainer.scrollTop = elements.chatMessagesContainer.scrollHeight;
  }

  // --- Right Panel Inspector & Sidebar Resizer / Collapsible ---
  function setupSidebarResizeAndCollapse() {
    if (!elements.sidebarRight) return;

    // 1. Resizer dragging
    if (elements.sidebarResizer) {
      let isResizing = false;
      let startX = 0;
      let startWidth = 0;

      elements.sidebarResizer.addEventListener('mousedown', (e) => {
        isResizing = true;
        startX = e.clientX;
        startWidth = elements.sidebarRight.getBoundingClientRect().width;
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';

        const onMouseMove = (ev) => {
          if (!isResizing) return;
          const diffX = startX - ev.clientX; // dragging left increases right sidebar width
          let newWidth = startWidth + diffX;
          if (newWidth < 260) newWidth = 260;
          if (newWidth > 640) newWidth = 640;
          elements.sidebarRight.style.width = `${newWidth}px`;
        };

        const onMouseUp = () => {
          if (isResizing) {
            isResizing = false;
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
          }
        };

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
      });
    }

    // 2. Collapse / Expand Sidebar
    function setSidebarCollapsed(collapsed) {
      state.sidebarCollapsed = collapsed;
      localStorage.setItem('sidebar_collapsed', collapsed ? 'true' : 'false');
      if (collapsed) {
        elements.sidebarRight.classList.add('collapsed');
        if (elements.btnFloatingExpandSidebar) elements.btnFloatingExpandSidebar.style.display = 'flex';
        if (elements.btnToggleRightPanel) elements.btnToggleRightPanel.classList.add('active');
      } else {
        elements.sidebarRight.classList.remove('collapsed');
        if (elements.btnFloatingExpandSidebar) elements.btnFloatingExpandSidebar.style.display = 'none';
        if (elements.btnToggleRightPanel) elements.btnToggleRightPanel.classList.remove('active');
      }
    }

    if (elements.btnToggleSidebar) {
      elements.btnToggleSidebar.addEventListener('click', () => {
        setSidebarCollapsed(true);
        showToast('Đã thu gọn thanh bên phải. Nhấn nút nổi hoặc icon trên thanh công cụ để mở lại.', 'info');
      });
    }

    if (elements.btnToggleRightPanel) {
      elements.btnToggleRightPanel.addEventListener('click', () => {
        setSidebarCollapsed(!state.sidebarCollapsed);
      });
    }

    if (elements.btnFloatingExpandSidebar) {
      elements.btnFloatingExpandSidebar.addEventListener('click', () => {
        setSidebarCollapsed(false);
      });
    }

    // Restore initial state
    if (state.sidebarCollapsed) {
      setSidebarCollapsed(true);
    }

    // 3. Chat KB Card Accordion toggle (in right inspector)
    if (elements.chatKbCardHeader && elements.chatKbCardBody) {
      elements.chatKbCardHeader.addEventListener('click', (e) => {
        if (e.target.closest('button') || e.target.closest('input')) return;
        const isHidden = elements.chatKbCardBody.style.display === 'none';
        elements.chatKbCardBody.style.display = isHidden ? 'block' : 'none';
        if (elements.chatKbChevron) {
          elements.chatKbChevron.style.transform = isHidden ? 'rotate(0deg)' : 'rotate(-90deg)';
        }
      });
    }
  }

  function setupRightPanelTabs() {
    elements.tabRelDocs.addEventListener('click', () => {
      elements.tabRelDocs.classList.add('active');
      elements.tabSysInfo.classList.remove('active');
      elements.paneSources.style.display = 'flex';
      elements.paneInfo.style.display = 'none';
    });

    elements.tabSysInfo.addEventListener('click', () => {
      elements.tabSysInfo.classList.add('active');
      elements.tabRelDocs.classList.remove('active');
      elements.paneInfo.style.display = 'flex';
      elements.paneSources.style.display = 'none';
      if (elements.panelColabUrl && state.colabUrl) {
        elements.panelColabUrl.value = state.colabUrl;
      }
      updateColabStatusUI();
    });

    // Delegate click on source item cards
    elements.rightPanelSourcesList.addEventListener('click', (e) => {
      const card = e.target.closest('.source-item-card');
      if (card) {
        const cId = parseInt(card.getAttribute('data-chunk-id'), 10);
        const found = state.currentSources.find(s => s.chunk_id === cId) || {
          chunk_id: cId,
          source: card.querySelector('.source-card-filename')?.textContent || 'Tài liệu',
          score: 0.85,
          text: 'Văn bản trích dẫn nguồn đối chiếu theo chuẩn RAG Từ Zero.'
        };
        showCitationModal(found);
      }
    });

    // Quick click on Colab row to switch to config
    const rowColabClick = document.getElementById('row-colab-status-click');
    if (rowColabClick) {
      rowColabClick.addEventListener('click', () => {
        if (elements.tabSysInfo) {
          elements.tabSysInfo.click();
          setTimeout(() => {
            if (elements.panelColabUrl) elements.panelColabUrl.focus();
          }, 80);
        }
      });
    }

    // Citation Modal Close
    elements.btnCloseCitationModal.addEventListener('click', () => {
      elements.citationPreviewModal.style.display = 'none';
    });
    elements.btnCloseCitationFooter.addEventListener('click', () => {
      elements.citationPreviewModal.style.display = 'none';
    });
    elements.btnCopyCitationText.addEventListener('click', () => {
      navigator.clipboard.writeText(elements.citationModalContent.textContent || '');
      showToast('Đã sao chép đoạn trích vào bộ nhớ tạm!', 'success');
    });
  }

  function updateRightPanelSources(sources) {
    state.currentSources = sources || [];
    const count = (sources && sources.length) ? sources.length : 0;
    if (elements.rightPanelSourcesCount) elements.rightPanelSourcesCount.textContent = count;
    if (!elements.rightPanelSourcesList) return;

    if (!sources || sources.length === 0) {
      elements.rightPanelSourcesList.innerHTML = `
        <div class="empty-sources-state" id="empty-sources-state">
          <i class="fa-solid fa-magnifying-glass"></i>
          <p>Chưa có trích dẫn nào.<br>Hãy đặt câu hỏi để AI đối chiếu nguồn từ Kho Tri Thức.</p>
        </div>
      `;
      return;
    }

    elements.rightPanelSourcesList.innerHTML = sources.map((s, idx) => {
      const srcName = s.source || 'Tài liệu';
      const isPdf = srcName.toLowerCase().endsWith('.pdf');
      const isPpt = srcName.toLowerCase().endsWith('.pptx') || srcName.toLowerCase().endsWith('.ppt');
      const isMd = srcName.toLowerCase().endsWith('.md');
      const badgeClass = isPdf ? (idx % 2 === 0 ? 'pdf-purple' : 'pdf-blue') : (isPpt ? 'ppt-orange' : (isMd ? 'pdf-blue' : 'pdf-purple'));
      const badgeText = isPdf ? 'PDF' : (isPpt ? 'PPT' : (isMd ? 'MD' : 'TXT'));
      const score = Math.round((s.score || 0.8) * 100) / 100;
      return `
        <div class="source-item-card" data-chunk-id="${s.chunk_id || idx + 1}">
          <div class="source-file-badge ${badgeClass}">${badgeText}</div>
          <div class="source-card-details">
            <div class="source-card-filename">${escapeHTML(srcName)}</div>
            <div class="source-card-score-line">Đoạn #${s.chunk_id || idx + 1} • Độ tương đồng: ${score}</div>
          </div>
        </div>
      `;
    }).join('');
  }

  function showCitationModal(source) {
    elements.citationModalBadge.textContent = `[${source.chunk_id || 1}]`;
    elements.citationModalSource.textContent = source.source || 'Tài liệu';
    const percent = Math.round((source.score || 0.85) * 100);
    elements.citationModalScore.textContent = `${source.score || 0.85} (${percent}% Khớp)`;
    elements.citationModalContent.innerHTML = `<mark class="rag-highlight">${escapeHTML(source.text || '')}</mark>`;
    elements.citationPreviewModal.style.display = 'flex';
  }

  // --- Knowledge Base & Backend Status ---
  function setupKnowledgeBase() {
    if (elements.btnUploadNewDoc) {
      elements.btnUploadNewDoc.addEventListener('click', () => {
        elements.kbViewUploadInput.click();
      });
    }

    if (elements.kbViewUploadInput) {
      elements.kbViewUploadInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
          const explicitFolder = elements.kbViewUploadInput.getAttribute('data-target-folder');
          const targetFolder = explicitFolder || ((elements.kbFolderFilter && elements.kbFolderFilter.value !== 'all') 
            ? elements.kbFolderFilter.value 
            : 'Chung');
          elements.kbViewUploadInput.removeAttribute('data-target-folder');
          uploadFileWithProgress(e.target.files[0], targetFolder, false);
          e.target.value = '';
        }
      });
    }

    if (elements.btnReindexKbView) {
      elements.btnReindexKbView.addEventListener('click', reindexKnowledgeBase);
    }

    // Search filter
    if (elements.kbSearchBox) {
      elements.kbSearchBox.addEventListener('input', () => {
        filterKbTable();
      });
    }

    // Tab filter
    elements.kbFilterTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        elements.kbFilterTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        filterKbTable();
      });
    });
  }

  function setupFolderModals() {
    // 1. Create Folder Modal
    const openCreateFolder = () => {
      if (elements.createFolderModal) {
        elements.createFolderModal.style.display = 'flex';
        if (elements.inputNewFolderName) {
          elements.inputNewFolderName.value = '';
          elements.inputNewFolderName.focus();
        }
      }
    };
    if (elements.btnCreateFolderModal) elements.btnCreateFolderModal.addEventListener('click', openCreateFolder);
    if (elements.btnQuickNewFolder) elements.btnQuickNewFolder.addEventListener('click', openCreateFolder);

    const closeCreateFolder = () => {
      if (elements.createFolderModal) elements.createFolderModal.style.display = 'none';
    };
    if (elements.btnCloseFolderModal) elements.btnCloseFolderModal.addEventListener('click', closeCreateFolder);
    if (elements.btnCancelFolderModal) elements.btnCancelFolderModal.addEventListener('click', closeCreateFolder);

    if (elements.createFolderForm) {
      elements.createFolderForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const folderName = elements.inputNewFolderName ? elements.inputNewFolderName.value.trim() : '';
        if (!folderName) return;

        try {
          const res = await fetch('/api/rag/create-folder', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ folder_name: folderName })
          });
          const data = await res.json();
          if (res.ok) {
            showToast(data.message || `Đã tạo thư mục "${folderName}"!`, 'success');
            closeCreateFolder();
            await loadRagStatus();
          } else {
            showToast(data.detail || 'Lỗi khi tạo thư mục', 'error');
          }
        } catch (err) {
          showToast(`Lỗi: ${err.message}`, 'error');
        }
      });
    }

    // 2. Move File Modal
    const closeMoveModal = () => {
      if (elements.moveFileModal) elements.moveFileModal.style.display = 'none';
      state.movingFile = null;
    };
    if (elements.btnCloseMoveModal) elements.btnCloseMoveModal.addEventListener('click', closeMoveModal);
    if (elements.btnCancelMoveModal) elements.btnCancelMoveModal.addEventListener('click', closeMoveModal);

    if (elements.moveFileForm) {
      elements.moveFileForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!state.movingFile) return;
        const targetFolder = elements.selectMoveTargetFolder ? elements.selectMoveTargetFolder.value : 'Chung';

        try {
          showToast(`Đang chuyển "${state.movingFile}" sang thư mục "${targetFolder}"...`, 'info');
          const res = await fetch('/api/rag/move-file', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              filename: state.movingFile,
              target_folder: targetFolder
            })
          });
          const data = await res.json();
          if (res.ok) {
            showToast(data.message || 'Đã chuyển thư mục thành công!', 'success');
            closeMoveModal();
            await loadRagStatus();
          } else {
            showToast(data.detail || 'Lỗi khi chuyển thư mục', 'error');
          }
        } catch (err) {
          showToast(`Lỗi: ${err.message}`, 'error');
        }
      });
    }

    // 3. KB Folder Filter Dropdown
    if (elements.kbFolderFilter) {
      elements.kbFolderFilter.addEventListener('change', (e) => {
        state.selectedFolderFilter = e.target.value;
        filterKbTable();
      });
    }
  }

  function filterKbTable() {
    if (!elements.kbFullTableBody) return;
    const filterFolder = state.selectedFolderFilter || 'all';
    const activeTab = document.querySelector('.filter-tab.active');
    const extFilter = activeTab ? activeTab.getAttribute('data-ext') : 'all';
    const searchVal = elements.kbSearchBox ? elements.kbSearchBox.value.toLowerCase().trim() : '';

    const folderGroups = state.folders || ['Chung'];

    folderGroups.forEach(folderName => {
      const dividerRow = elements.kbFullTableBody.querySelector(`tr.folder-group-divider-row[data-group-folder="${folderName}"]`);
      const emptyRow = elements.kbFullTableBody.querySelector(`tr.empty-folder-row[data-folder="${folderName}"]`);
      const fileRows = elements.kbFullTableBody.querySelectorAll(`tr[data-filename][data-folder="${folderName}"]`);

      const folderMatches = (filterFolder === 'all') || (folderName === filterFolder);

      let visibleFilesCount = 0;
      fileRows.forEach(r => {
        const rowExt = r.getAttribute('data-ext') || '';
        const rowText = r.innerText.toLowerCase();

        const matchExt = (extFilter === 'all') || (rowExt === extFilter);
        const matchSearch = !searchVal || rowText.includes(searchVal);

        const isVisible = folderMatches && matchExt && matchSearch;
        r.style.display = isVisible ? '' : 'none';
        if (isVisible) visibleFilesCount++;
      });

      if (emptyRow) {
        emptyRow.style.display = (folderMatches && extFilter === 'all' && !searchVal) ? '' : 'none';
      }

      if (dividerRow) {
        if (filterFolder === 'all') {
          const shouldShow = visibleFilesCount > 0 || (fileRows.length === 0 && extFilter === 'all' && !searchVal);
          dividerRow.style.display = shouldShow ? '' : 'none';
        } else {
          dividerRow.style.display = folderMatches ? '' : 'none';
        }
      }
    });

    // Update active state on folder cards
    if (elements.kbFoldersGrid) {
      elements.kbFoldersGrid.querySelectorAll('.kb-folder-card').forEach(card => {
        const cFolder = card.getAttribute('data-folder');
        if (cFolder === filterFolder) {
          card.classList.add('active');
        } else {
          card.classList.remove('active');
        }
      });
    }
  }

  function renderKbFoldersGrid(files) {
    if (!elements.kbFoldersGrid) return;
    const folders = state.folders || ['Chung'];
    if (elements.kbFoldersCount) elements.kbFoldersCount.textContent = folders.length;

    const currentFolder = state.selectedFolderFilter || 'all';

    let html = `
      <div class="kb-folder-card all-card ${currentFolder === 'all' ? 'active' : ''}" data-folder="all">
        <i class="fa-solid fa-layer-group kb-folder-card-icon"></i>
        <div class="kb-folder-card-info">
          <span class="kb-folder-card-name">Tất cả thư mục</span>
          <span class="kb-folder-card-count">${files.length} tệp (${folders.length} thư mục)</span>
        </div>
      </div>
    `;

    folders.forEach(f => {
      const count = files.filter(x => (x.folder || 'Chung') === f).length;
      const isActive = currentFolder === f;
      html += `
        <div class="kb-folder-card ${isActive ? 'active' : ''}" data-folder="${escapeHTML(f)}">
          <i class="fa-solid fa-folder kb-folder-card-icon"></i>
          <div class="kb-folder-card-info">
            <span class="kb-folder-card-name" title="${escapeHTML(f)}">${escapeHTML(f)}</span>
            <span class="kb-folder-card-count">${count} tài liệu</span>
          </div>
        </div>
      `;
    });

    html += `
      <div class="kb-folder-card kb-folder-card-add" id="card-quick-add-folder">
        <i class="fa-solid fa-folder-plus" style="font-size: 1.15rem; color: var(--accent-primary);"></i>
        <div class="kb-folder-card-info">
          <span class="kb-folder-card-name" style="color: var(--accent-primary);">+ Thư mục mới</span>
        </div>
      </div>
    `;

    elements.kbFoldersGrid.innerHTML = html;

    // Attach card click handlers
    elements.kbFoldersGrid.querySelectorAll('.kb-folder-card[data-folder]').forEach(card => {
      card.addEventListener('click', () => {
        const folder = card.getAttribute('data-folder');
        state.selectedFolderFilter = folder;
        if (elements.kbFolderFilter) elements.kbFolderFilter.value = folder;
        filterKbTable();
      });
    });

    const addCard = elements.kbFoldersGrid.querySelector('#card-quick-add-folder');
    if (addCard && elements.createFolderModal) {
      addCard.addEventListener('click', () => {
        elements.createFolderModal.style.display = 'flex';
        if (elements.inputNewFolderName) {
          elements.inputNewFolderName.value = '';
          elements.inputNewFolderName.focus();
        }
      });
    }
  }

  async function loadRagStatus() {
    try {
      const res = await fetch('/api/rag/status');
      if (res.ok) {
        const data = await res.json();
        const files = data.files_detail || [];
        const totalKb = files.reduce((acc, cur) => acc + (cur.size_kb || 0), 0);
        const totalChunks = data.total_chunks || 0;

        state.availableDocs = files;
        state.folders = (data.folders && data.folders.length > 0) ? data.folders : ['Chung'];

        // Populate Folder Filter in KB View
        if (elements.kbFolderFilter) {
          const currentVal = elements.kbFolderFilter.value || 'all';
          elements.kbFolderFilter.innerHTML = `
            <option value="all">📂 Tất cả thư mục (${state.folders.length})</option>
            ${state.folders.map(f => {
              const count = files.filter(x => (x.folder || 'Chung') === f).length;
              return `<option value="${escapeHTML(f)}">📁 ${escapeHTML(f)} (${count})</option>`;
            }).join('')}
          `;
          if (state.folders.includes(currentVal) || currentVal === 'all') {
            elements.kbFolderFilter.value = currentVal;
          }
        }

        // Populate Target Folder in Move Modal
        if (elements.selectMoveTargetFolder) {
          elements.selectMoveTargetFolder.innerHTML = state.folders.map(f => `
            <option value="${escapeHTML(f)}">📁 ${escapeHTML(f)}</option>
          `).join('');
        }

        renderChatKbDocsList();

        // Update sidebar count
        if (elements.sidebarKbCount) elements.sidebarKbCount.textContent = files.length;

        // Update inspector right panel
        if (elements.inspectorKbCount) elements.inspectorKbCount.textContent = `Kho Tri Thức (${files.length} tài liệu)`;
        if (elements.inspectorVectorStatus) elements.inspectorVectorStatus.textContent = `${totalChunks} chunks sẵn sàng`;

        // Update Dashboard KPIs
        if (elements.kpiTotalDocs) elements.kpiTotalDocs.textContent = files.length;
        if (elements.kpiTotalSize) {
          elements.kpiTotalSize.textContent = totalKb >= 1024 
            ? `${(totalKb / 1024).toFixed(1)} MB` 
            : `${totalKb.toFixed(1)} KB`;
        }
        if (elements.kpiTotalChunks) elements.kpiTotalChunks.textContent = totalChunks;
        if (elements.kpiTotalChats) elements.kpiTotalChats.textContent = state.recentChats.length;

        // Update all type filter counters accurately
        if (elements.kbCountAll) elements.kbCountAll.textContent = files.length;
        if (elements.kbCountPdf) elements.kbCountPdf.textContent = files.filter(f => (f.ext || '').toLowerCase() === 'pdf').length;
        if (elements.kbCountDocx) elements.kbCountDocx.textContent = files.filter(f => (f.ext || '').toLowerCase() === 'docx').length;
        if (elements.kbCountTxt) elements.kbCountTxt.textContent = files.filter(f => (f.ext || '').toLowerCase() === 'txt').length;
        if (elements.kbCountMd) elements.kbCountMd.textContent = files.filter(f => (f.ext || '').toLowerCase() === 'md').length;

        renderKbFoldersGrid(files);
        renderKbTable(files);
      }
    } catch (e) {
      console.warn('Status error:', e);
    }
  }

  function renderKbTable(files) {
    if (!elements.kbFullTableBody) return;
    const folders = state.folders || ['Chung'];
    if (files.length === 0 && folders.length === 0) {
      elements.kbFullTableBody.innerHTML = `
        <tr>
          <td colspan="7" style="padding: 2.5rem; text-align: center; color: var(--text-muted);">
            Kho tri thức data/raw/ chưa có tài liệu. Bấm "+ Thêm tài liệu" để tải lên!
          </td>
        </tr>
      `;
      return;
    }

    const groups = {};
    folders.forEach(f => { groups[f] = []; });
    files.forEach(f => {
      const folder = f.folder || 'Chung';
      if (!groups[folder]) groups[folder] = [];
      groups[folder].push(f);
    });

    const folderKeys = Object.keys(groups).sort((a, b) => {
      if (a === 'Chung') return -1;
      if (b === 'Chung') return 1;
      return a.localeCompare(b);
    });

    let html = '';

    folderKeys.forEach(folderName => {
      const docsInFolder = groups[folderName];

      // Folder Group Divider Row
      html += `
        <tr class="folder-group-divider-row" data-group-folder="${escapeHTML(folderName)}" style="cursor: pointer;" title="Bấm để thu gọn / mở rộng thư mục này">
          <td colspan="7">
            <div class="folder-group-divider">
              <div class="folder-group-divider-left">
                <i class="fa-solid fa-chevron-down table-folder-chevron" style="font-size: 0.72rem; transition: transform 0.2s; color: var(--text-muted);"></i>
                <i class="fa-solid fa-folder-open text-accent"></i>
                <span>Thư mục: <strong>${escapeHTML(folderName)}</strong></span>
                <span class="folder-group-divider-badge">${docsInFolder.length} tài liệu</span>
              </div>
              <button type="button" class="btn-text-action btn-upload-to-specific-folder" data-folder="${escapeHTML(folderName)}" title="Tải tài liệu vào thư mục ${escapeHTML(folderName)}" style="font-size: 0.72rem;">
                <i class="fa-solid fa-plus"></i> Thêm tệp vào đây
              </button>
            </div>
          </td>
        </tr>
      `;

      if (docsInFolder.length === 0) {
        html += `
          <tr class="empty-folder-row" data-folder="${escapeHTML(folderName)}">
            <td colspan="7">
              <i class="fa-regular fa-folder-open" style="margin-right: 0.35rem;"></i> Thư mục trống. Bạn có thể kéo thả hoặc nạp tài liệu vào thư mục này.
            </td>
          </tr>
        `;
      } else {
        docsInFolder.forEach(f => {
          const ext = f.ext || 'txt';
          const folder = f.folder || 'Chung';
          const isDocx = ext.toLowerCase() === 'docx';
          const isPdf = ext.toLowerCase() === 'pdf';
          const isMd = ext.toLowerCase() === 'md';

          let icon = 'fa-regular fa-file-lines text-purple';
          if (isPdf) {
            icon = 'fa-regular fa-file-pdf text-red';
          } else if (isMd) {
            icon = 'fa-regular fa-file-code text-blue';
          } else if (isDocx) {
            icon = 'fa-regular fa-file-word text-blue';
          }

          html += `
            <tr data-ext="${escapeHTML(ext.toLowerCase())}" data-folder="${escapeHTML(folder)}" data-filename="${escapeHTML(f.name)}">
              <td style="font-weight: 700;">
                <i class="${icon}" style="margin-right: 0.5rem;"></i>
                ${escapeHTML(f.name)}
              </td>
              <td>
                <span class="folder-badge" title="Thư mục: ${escapeHTML(folder)}">
                  <i class="fa-regular fa-folder"></i> ${escapeHTML(folder)}
                </span>
              </td>
              <td><span class="badge-num" style="text-transform: uppercase;">${escapeHTML(ext)}</span></td>
              <td class="font-mono text-muted">${f.size_kb} KB</td>
              <td class="text-muted">${escapeHTML(f.mtime)}</td>
              <td>
                <span class="status-badge-live"><i class="fa-solid fa-check"></i> Đã nạp Vector</span>
              </td>
              <td style="text-align: center;">
                <div style="display: inline-flex; gap: 0.35rem;">
                  <button type="button" class="msg-action-btn btn-move-file" data-name="${escapeHTML(f.name)}" data-folder="${escapeHTML(folder)}" title="Chuyển thư mục cho tệp này">
                    <i class="fa-solid fa-folder-tree" style="color: var(--accent-primary);"></i>
                  </button>
                  <button type="button" class="msg-action-btn btn-delete-file" data-name="${escapeHTML(f.name)}" title="Xóa tài liệu này">
                    <i class="fa-regular fa-trash-can" style="color: #ef4444;"></i>
                  </button>
                </div>
              </td>
            </tr>
          `;
        });
      }
    });

    elements.kbFullTableBody.innerHTML = html;

    // Attach folder collapse/expand in KB table
    elements.kbFullTableBody.querySelectorAll('.folder-group-divider-row').forEach(row => {
      row.addEventListener('click', (e) => {
        if (e.target.closest('.btn-upload-to-specific-folder')) return;
        const folderName = row.getAttribute('data-group-folder');
        const isCollapsed = row.classList.toggle('collapsed');
        const chevron = row.querySelector('.table-folder-chevron');
        if (chevron) {
          chevron.style.transform = isCollapsed ? 'rotate(-90deg)' : '';
        }
        const fileRows = elements.kbFullTableBody.querySelectorAll(`tr[data-filename][data-folder="${folderName}"]`);
        fileRows.forEach(fr => {
          fr.style.display = isCollapsed ? 'none' : '';
        });
        const emptyRow = elements.kbFullTableBody.querySelector(`tr.empty-folder-row[data-folder="${folderName}"]`);
        if (emptyRow) {
          emptyRow.style.display = isCollapsed ? 'none' : '';
        }
      });
    });

    // Attach move handlers
    elements.kbFullTableBody.querySelectorAll('.btn-move-file').forEach(btn => {
      btn.addEventListener('click', () => {
        const fname = btn.getAttribute('data-name');
        const curFolder = btn.getAttribute('data-folder') || 'Chung';
        state.movingFile = fname;
        if (elements.moveFileTargetName) elements.moveFileTargetName.textContent = fname;
        if (elements.selectMoveTargetFolder) elements.selectMoveTargetFolder.value = curFolder;
        if (elements.moveFileModal) elements.moveFileModal.style.display = 'flex';
      });
    });

    // Attach delete handlers
    elements.kbFullTableBody.querySelectorAll('.btn-delete-file').forEach(btn => {
      btn.addEventListener('click', () => {
        const fname = btn.getAttribute('data-name');
        if (confirm(`Bạn có chắc muốn xóa "${fname}" khỏi kho tri thức?`)) {
          deleteDocument(fname);
        }
      });
    });

    // Attach upload-to-specific-folder handlers
    elements.kbFullTableBody.querySelectorAll('.btn-upload-to-specific-folder').forEach(btn => {
      btn.addEventListener('click', () => {
        const fld = btn.getAttribute('data-folder');
        if (elements.kbViewUploadInput) {
          elements.kbViewUploadInput.setAttribute('data-target-folder', fld);
          elements.kbViewUploadInput.click();
        }
      });
    });

    filterKbTable();
  }

  // --- Real Percentage Progress Upload Function ---
  function uploadFileWithProgress(file, targetFolder = '', bindToChat = false) {
    return new Promise((resolve, reject) => {
      if (!file) return reject(new Error('Chưa chọn tệp'));

      // 1. Show Progress Modal
      if (elements.uploadProgressModal) {
        elements.uploadProgressModal.style.display = 'flex';
        if (elements.uploadProgressFilename) elements.uploadProgressFilename.textContent = file.name;
        if (elements.uploadProgressPct) elements.uploadProgressPct.textContent = '0%';
        if (elements.uploadProgressFill) elements.uploadProgressFill.style.width = '0%';
        if (elements.uploadProgressSub) elements.uploadProgressSub.textContent = 'Đang đọc và truyền tệp tin lên máy chủ...';
        
        // Reset step classes
        [elements.stepUpload, elements.stepExtract, elements.stepEmbed, elements.stepDone].forEach(step => {
          if (step) step.classList.remove('active', 'done');
        });
        if (elements.stepUpload) elements.stepUpload.classList.add('active');
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const base64Data = e.target.result;
        const xhr = new XMLHttpRequest();
        const endpoint = '/api/rag/upload-file';

        // Track real upload percentage
        xhr.upload.onprogress = (evt) => {
          if (evt.lengthComputable && elements.uploadProgressFill && elements.uploadProgressPct) {
            // Scale upload progress from 0% to 80%
            const pct = Math.min(80, Math.round((evt.loaded / evt.total) * 80));
            elements.uploadProgressFill.style.width = `${pct}%`;
            elements.uploadProgressPct.textContent = `${pct}%`;
            if (pct >= 40 && elements.stepUpload) {
              elements.stepUpload.classList.add('done');
              if (elements.stepExtract) elements.stepExtract.classList.add('active');
              if (elements.uploadProgressSub) elements.uploadProgressSub.textContent = 'Đang truyền dữ liệu & trích xuất văn bản...';
            }
          }
        };

        xhr.onload = async () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const resData = JSON.parse(xhr.responseText);
              // Advance to 92% (Embedding)
              if (elements.uploadProgressFill) elements.uploadProgressFill.style.width = '92%';
              if (elements.uploadProgressPct) elements.uploadProgressPct.textContent = '92%';
              if (elements.stepUpload) elements.stepUpload.classList.add('done');
              if (elements.stepExtract) elements.stepExtract.classList.add('done');
              if (elements.stepEmbed) elements.stepEmbed.classList.add('active');
              if (elements.uploadProgressSub) elements.uploadProgressSub.textContent = 'Đang vector hóa (Embedding) và cập nhật Vector Store...';

              setTimeout(() => {
                // Done 100%
                if (elements.uploadProgressFill) elements.uploadProgressFill.style.width = '100%';
                if (elements.uploadProgressPct) elements.uploadProgressPct.textContent = '100%';
                if (elements.stepEmbed) elements.stepEmbed.classList.add('done');
                if (elements.stepDone) elements.stepDone.classList.add('active', 'done');
                if (elements.uploadProgressSub) elements.uploadProgressSub.textContent = 'Hoàn tất nạp Vector! Sẵn sàng tra cứu.';

                setTimeout(async () => {
                  if (elements.uploadProgressModal) elements.uploadProgressModal.style.display = 'none';
                  showToast(`Đã thêm thành công ${file.name} vào kho tri thức!`, 'success');
                  await loadRagStatus();

                  if (bindToChat) {
                    if (!state.chatSessions[state.activeChatId]) {
                      state.chatSessions[state.activeChatId] = { id: state.activeChatId, allowedDocs: [] };
                    }
                    const curr = state.chatSessions[state.activeChatId].allowedDocs || [];
                    if (!curr.includes('all')) {
                      if (!curr.includes(file.name)) curr.push(file.name);
                      state.chatSessions[state.activeChatId].allowedDocs = curr;
                    }
                    saveChatSessions();
                    renderChatKbDocsList();
                  }
                  resolve(resData);
                }, 600);
              }, 400);

            } catch (err) {
              if (elements.uploadProgressModal) elements.uploadProgressModal.style.display = 'none';
              showToast('Lỗi xử lý phản hồi từ máy chủ', 'error');
              reject(err);
            }
          } else {
            if (elements.uploadProgressModal) elements.uploadProgressModal.style.display = 'none';
            let errDetail = 'Lỗi nạp file';
            try {
              const errJson = JSON.parse(xhr.responseText);
              errDetail = errJson.detail || errDetail;
            } catch (ex) {}
            showToast(`Lỗi: ${errDetail}`, 'error');
            reject(new Error(errDetail));
          }
        };

        xhr.onerror = () => {
          if (elements.uploadProgressModal) elements.uploadProgressModal.style.display = 'none';
          showToast('Lỗi mạng khi tải lên tài liệu', 'error');
          reject(new Error('Network error'));
        };

        xhr.open('POST', endpoint, true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send(JSON.stringify({
          filename: file.name,
          content_base64: base64Data,
          folder: targetFolder || 'Chung'
        }));
      };

      reader.onerror = (err) => {
        if (elements.uploadProgressModal) elements.uploadProgressModal.style.display = 'none';
        showToast('Lỗi khi đọc file cục bộ', 'error');
        reject(err);
      };

      reader.readAsDataURL(file);
    });
  }

  async function deleteDocument(filename) {
    try {
      showToast(`Đang xóa ${filename}...`, 'info');
      const res = await fetch('/api/rag/delete-file', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename })
      });
      if (res.ok) {
        showToast(`Đã xóa ${filename}!`, 'success');
        loadRagStatus();
      }
    } catch (e) {
      showToast('Lỗi khi xóa file!', 'error');
    }
  }

  async function reindexKnowledgeBase() {
    try {
      showToast('Đang lập chỉ mục lại toàn bộ Vector Store...', 'info');
      const res = await fetch('/api/rag/ingest', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message || 'Lập chỉ mục thành công!', 'success');
        loadRagStatus();
      }
    } catch (e) {
      showToast('Lỗi khi Re-index!', 'error');
    }
  }

  // --- Settings View Events & Synchronization ---
  function setupSettingsEvents() {
    // 1. Top-K Buttons (Page & Modal synchronization)
    function setTopK(k) {
      state.topK = k;
      elements.topKButtons.forEach(b => {
        b.classList.toggle('active', parseInt(b.getAttribute('data-k'), 10) === k);
      });
      if (elements.modalBtnChunkK) {
        elements.modalBtnChunkK.forEach(b => {
          b.classList.toggle('active', parseInt(b.getAttribute('data-k'), 10) === k);
        });
      }
    }

    elements.topKButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        setTopK(parseInt(btn.getAttribute('data-k'), 10));
      });
    });

    if (elements.modalBtnChunkK) {
      elements.modalBtnChunkK.forEach(btn => {
        btn.addEventListener('click', () => {
          setTopK(parseInt(btn.getAttribute('data-k'), 10));
        });
      });
    }

    // 2. Similarity Threshold (Page & Modal synchronization)
    function setThreshold(val) {
      state.similarityThreshold = val;
      const valStr = val.toFixed(2);
      if (elements.sliderThreshold) elements.sliderThreshold.value = val;
      if (elements.labelThresholdVal) elements.labelThresholdVal.textContent = valStr;
      if (elements.modalSliderThreshold) elements.modalSliderThreshold.value = val;
      if (elements.modalLabelThresholdVal) elements.modalLabelThresholdVal.textContent = valStr;
    }

    if (elements.sliderThreshold) {
      elements.sliderThreshold.addEventListener('input', (e) => {
        setThreshold(parseFloat(e.target.value));
      });
    }
    if (elements.modalSliderThreshold) {
      elements.modalSliderThreshold.addEventListener('input', (e) => {
        setThreshold(parseFloat(e.target.value));
      });
    }

    // 3. Temperature (Page & Modal synchronization)
    function setTemperature(val) {
      state.temperature = val;
      const valStr = val.toFixed(2);
      if (elements.sliderTemperature) elements.sliderTemperature.value = val;
      if (elements.labelTemperatureVal) elements.labelTemperatureVal.textContent = valStr;
      if (elements.modalSliderTemperature) elements.modalSliderTemperature.value = val;
      if (elements.modalLabelTemperatureVal) elements.modalLabelTemperatureVal.textContent = valStr;
    }

    if (elements.sliderTemperature) {
      elements.sliderTemperature.addEventListener('input', (e) => {
        setTemperature(parseFloat(e.target.value));
      });
    }
    if (elements.modalSliderTemperature) {
      elements.modalSliderTemperature.addEventListener('input', (e) => {
        setTemperature(parseFloat(e.target.value));
      });
    }

    // 4. Theme Choice Buttons
    if (elements.btnSetLightTheme) elements.btnSetLightTheme.addEventListener('click', () => applyTheme('light'));
    if (elements.btnSetDarkTheme) elements.btnSetDarkTheme.addEventListener('click', () => applyTheme('dark'));
    if (elements.modalBtnLightTheme) elements.modalBtnLightTheme.addEventListener('click', () => applyTheme('light'));
    if (elements.modalBtnDarkTheme) elements.modalBtnDarkTheme.addEventListener('click', () => applyTheme('dark'));

    // 5. UI Language Selection (Both on Page & Modal)
    if (elements.selectUiLanguage) {
      elements.selectUiLanguage.value = state.uiLanguage;
      elements.selectUiLanguage.addEventListener('change', (e) => {
        applyLanguage(e.target.value);
        showToast(e.target.value === 'en' ? 'Interface switched to English' : 'Đã đổi giao diện sang Tiếng Việt', 'info');
      });
    }
    if (elements.modalSelectUiLanguage) {
      elements.modalSelectUiLanguage.value = state.uiLanguage;
      elements.modalSelectUiLanguage.addEventListener('change', (e) => {
        applyLanguage(e.target.value);
        showToast(e.target.value === 'en' ? 'Interface switched to English' : 'Đã đổi giao diện sang Tiếng Việt', 'info');
      });
    }

    // 6. AI Response Language Selection (Both on Page & Modal)
    if (elements.selectAiResponseLanguage) {
      elements.selectAiResponseLanguage.value = state.aiResponseLanguage;
      elements.selectAiResponseLanguage.addEventListener('change', (e) => {
        setAiResponseLanguage(e.target.value, true);
      });
    }
    if (elements.modalSelectAiLanguage) {
      elements.modalSelectAiLanguage.value = state.aiResponseLanguage;
      elements.modalSelectAiLanguage.addEventListener('change', (e) => {
        setAiResponseLanguage(e.target.value, true);
      });
    }

    // 7. Quick AI Language Toggle Button in Header
    if (elements.btnQuickAiLang) {
      elements.btnQuickAiLang.addEventListener('click', () => {
        const order = ['vi', 'en', 'auto'];
        const curIdx = order.indexOf(state.aiResponseLanguage);
        const nextLang = order[(curIdx + 1) % order.length];
        setAiResponseLanguage(nextLang, true);
      });
    }

    // 8. Settings Modal Open & Close Buttons
    if (elements.btnCloseSettingsModal) {
      elements.btnCloseSettingsModal.addEventListener('click', closeSettingsModal);
    }
    if (elements.btnSaveSettingsModal) {
      elements.btnSaveSettingsModal.addEventListener('click', () => {
        closeSettingsModal();
        showToast('Đã lưu cấu hình cài đặt thành công!', 'success');
      });
    }
    if (elements.btnFullSettingsView) {
      elements.btnFullSettingsView.addEventListener('click', () => {
        closeSettingsModal();
        switchView('settings');
      });
    }
    if (elements.settingsModal) {
      elements.settingsModal.addEventListener('click', (e) => {
        if (e.target === elements.settingsModal) {
          closeSettingsModal();
        }
      });
    }
  }

  // --- Feedback ---
  async function handleFeedback(type) {
    if (type === 'like') {
      elements.btnFeedbackLike.classList.add('btn-feedback-active-like');
      elements.btnFeedbackDislike.classList.remove('btn-feedback-active-dislike');
      showToast('Cảm ơn bạn! Đã ghi nhận phản hồi hữu ích 👍', 'success');
    } else {
      elements.btnFeedbackDislike.classList.add('btn-feedback-active-dislike');
      elements.btnFeedbackLike.classList.remove('btn-feedback-active-like');
      showToast('Đã ghi nhận phản hồi! Hệ thống sẽ cải thiện độ chính xác 👎', 'info');
    }

    try {
      await fetch('/api/rag/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating: type, timestamp: Date.now() })
      });
    } catch (e) {}
  }

  // --- Model Display Sync ---
  function syncModelDisplay(modelVal) {
    const text = 'Qwen3-4B (Google Colab GPU T4)';
    if (elements.inspectorModelName) elements.inspectorModelName.textContent = text;
    if (elements.dashModelName) elements.dashModelName.textContent = 'Qwen3-4B Q4_K_M (Tesla T4 GPU)';
  }

  // --- Per-Chat Knowledge Base & Sessions Management ---
  function loadChatSessions() {
    try {
      const saved = localStorage.getItem('researchmate_chat_sessions');
      if (saved) {
        state.chatSessions = JSON.parse(saved);
      }
    } catch (e) {}

    if (!state.chatSessions || typeof state.chatSessions !== 'object') {
      state.chatSessions = {};
    }

    if (!state.chatSessions['chat-default']) {
      state.chatSessions['chat-default'] = {
        id: 'chat-default',
        title: 'Hội thoại mặc định',
        allowedDocs: ['all']
      };
    }
    state.activeChatId = 'chat-default';
    saveChatSessions();
  }

  function saveChatSessions() {
    try {
      localStorage.setItem('researchmate_chat_sessions', JSON.stringify(state.chatSessions));
    } catch (e) {}
  }

  function getActiveChatAllowedDocs() {
    const session = state.chatSessions[state.activeChatId];
    if (!session || !session.allowedDocs || session.allowedDocs.includes('all')) {
      return (state.availableDocs || []).map(d => d.name || d);
    }
    return session.allowedDocs;
  }

  function renderChatKbDocsList() {
    if (!elements.chatKbDocsList) return;

    if (!state.availableDocs || state.availableDocs.length === 0) {
      elements.chatKbDocsList.innerHTML = `<div class="kb-loading-hint">Chưa có tài liệu trong Kho Tri Thức.</div>`;
      if (elements.chatKbSelectedCount) elements.chatKbSelectedCount.textContent = '0 doc';
      return;
    }

    const session = state.chatSessions[state.activeChatId] || { allowedDocs: ['all'] };
    const allowed = session.allowedDocs || ['all'];
    const isAll = allowed.includes('all');

    // Group documents by folder
    const groups = {};
    (state.folders || ['Chung']).forEach(f => {
      groups[f] = [];
    });
    state.availableDocs.forEach(doc => {
      const folder = doc.folder || 'Chung';
      if (!groups[folder]) groups[folder] = [];
      groups[folder].push(doc);
    });

    let activeCount = 0;
    const folderKeys = Object.keys(groups).sort((a, b) => {
      if (a === 'Chung') return -1;
      if (b === 'Chung') return 1;
      return a.localeCompare(b);
    });

    let html = '';
    folderKeys.forEach(folderName => {
      const docsInFolder = groups[folderName];
      const folderCheckedCount = docsInFolder.filter(d => isAll || allowed.some(a => a.toLowerCase() === (d.name || d).toLowerCase())).length;

      // Folders are collapsed initially by default until user clicks the folder header or chevron
      const isExpanded = state.expandedChatKbFolders && state.expandedChatKbFolders.has(folderName);
      const collapsedClass = isExpanded ? '' : 'collapsed';

      html += `
        <div class="chat-kb-folder-group" data-folder="${escapeHTML(folderName)}">
          <div class="chat-kb-folder-header ${collapsedClass}">
            <div class="chat-kb-folder-title">
              <i class="fa-solid fa-chevron-down chat-kb-folder-chevron"></i>
              <i class="fa-solid fa-folder text-accent"></i>
              <span>${escapeHTML(folderName)}</span>
            </div>
            <div style="display: flex; align-items: center; gap: 0.35rem;">
              <span class="badge-num">${folderCheckedCount}/${docsInFolder.length}</span>
              ${docsInFolder.length > 0 ? `
                <button type="button" class="btn-folder-toggle-all" data-folder="${escapeHTML(folderName)}" title="Chọn / Bỏ chọn tất cả tệp trong thư mục này" style="background: none; border: none; cursor: pointer; color: var(--accent-primary); font-size: 0.72rem; padding: 0.1rem 0.25rem;">
                  <i class="fa-solid fa-check-double"></i>
                </button>
              ` : ''}
            </div>
          </div>
          <div class="chat-kb-folder-items ${collapsedClass}">
            ${docsInFolder.length === 0 ? `
              <div style="padding: 0.35rem 0.5rem; font-size: 0.72rem; color: var(--text-muted); font-style: italic;">
                (Thư mục trống)
              </div>
            ` : docsInFolder.map(doc => {
              const name = doc.name || doc;
              const isChecked = isAll || allowed.some(a => a.toLowerCase() === name.toLowerCase());
              if (isChecked) activeCount++;
              const ext = (doc.ext || name.split('.').pop() || 'txt').toUpperCase();
              const isPdf = ext === 'PDF';
              const isDocx = ext === 'DOCX';

              let iconClass = 'fa-file-lines text-purple';
              if (isPdf) iconClass = 'fa-file-pdf text-red';
              else if (isDocx) iconClass = 'fa-file-word text-blue';

              return `
                <label class="chat-kb-doc-item" title="${escapeHTML(name)} (${escapeHTML(folderName)})">
                  <input type="checkbox" class="chat-kb-checkbox" data-folder="${escapeHTML(folderName)}" data-doc="${escapeHTML(name)}" ${isChecked ? 'checked' : ''}>
                  <i class="fa-regular ${iconClass}"></i>
                  <span class="doc-name">${escapeHTML(name)}</span>
                  <span class="doc-badge">${escapeHTML(ext)}</span>
                </label>
              `;
            }).join('')}
          </div>
        </div>
      `;
    });

    elements.chatKbDocsList.innerHTML = html;

    // Attach accordion collapse / expand handlers
    elements.chatKbDocsList.querySelectorAll('.chat-kb-folder-header').forEach(header => {
      header.addEventListener('click', (e) => {
        if (e.target.closest('.btn-folder-toggle-all')) return;
        const group = header.closest('.chat-kb-folder-group');
        const folderName = group ? group.getAttribute('data-folder') : '';
        const items = group ? group.querySelector('.chat-kb-folder-items') : null;
        if (items) {
          const isCollapsed = items.classList.contains('collapsed');
          if (isCollapsed) {
            items.classList.remove('collapsed');
            header.classList.remove('collapsed');
            if (!state.expandedChatKbFolders) state.expandedChatKbFolders = new Set();
            if (folderName) state.expandedChatKbFolders.add(folderName);
          } else {
            items.classList.add('collapsed');
            header.classList.add('collapsed');
            if (state.expandedChatKbFolders && folderName) state.expandedChatKbFolders.delete(folderName);
          }
        }
      });
    });

    // Attach folder toggle-all handlers
    elements.chatKbDocsList.querySelectorAll('.btn-folder-toggle-all').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const fName = btn.getAttribute('data-folder');
        const checkboxes = elements.chatKbDocsList.querySelectorAll(`.chat-kb-checkbox[data-folder="${fName}"]`);
        const allChecked = Array.from(checkboxes).every(cb => cb.checked);
        checkboxes.forEach(cb => {
          cb.checked = !allChecked;
        });
        updateActiveChatKbFromUI();
      });
    });

    if (elements.chatKbSelectedCount) {
      if (isAll || activeCount === state.availableDocs.length) {
        elements.chatKbSelectedCount.textContent = `Tất cả (${state.availableDocs.length})`;
      } else {
        elements.chatKbSelectedCount.textContent = `${activeCount}/${state.availableDocs.length} doc`;
      }
    }

    elements.chatKbDocsList.querySelectorAll('.chat-kb-checkbox').forEach(cb => {
      cb.addEventListener('change', () => {
        updateActiveChatKbFromUI();
      });
    });
  }

  function updateActiveChatKbFromUI() {
    const checkedDocs = [];
    elements.chatKbDocsList.querySelectorAll('.chat-kb-checkbox').forEach(cb => {
      if (cb.checked) {
        checkedDocs.push(cb.getAttribute('data-doc'));
      }
    });

    if (!state.chatSessions[state.activeChatId]) {
      state.chatSessions[state.activeChatId] = { id: state.activeChatId, title: 'Đoạn chat', allowedDocs: [] };
    }

    if (checkedDocs.length === state.availableDocs.length) {
      state.chatSessions[state.activeChatId].allowedDocs = ['all'];
    } else {
      state.chatSessions[state.activeChatId].allowedDocs = checkedDocs;
    }
    saveChatSessions();

    if (elements.chatKbSelectedCount) {
      if (checkedDocs.length === state.availableDocs.length) {
        elements.chatKbSelectedCount.textContent = `Tất cả (${state.availableDocs.length})`;
      } else {
        elements.chatKbSelectedCount.textContent = `${checkedDocs.length}/${state.availableDocs.length} doc`;
      }
    }
    showToast(`Đã lưu Knowledge Base riêng cho đoạn chat: ${checkedDocs.length} tài liệu`, 'info');
  }

  function setupChatKbEvents() {
    if (elements.btnChatKbSelectAll) {
      elements.btnChatKbSelectAll.addEventListener('click', () => {
        if (!state.chatSessions[state.activeChatId]) {
          state.chatSessions[state.activeChatId] = { id: state.activeChatId };
        }
        state.chatSessions[state.activeChatId].allowedDocs = ['all'];
        saveChatSessions();
        renderChatKbDocsList();
        showToast('Đoạn chat này sẽ tra cứu trên toàn bộ tài liệu', 'info');
      });
    }

    if (elements.btnChatKbClearAll) {
      elements.btnChatKbClearAll.addEventListener('click', () => {
        if (!state.chatSessions[state.activeChatId]) {
          state.chatSessions[state.activeChatId] = { id: state.activeChatId };
        }
        state.chatSessions[state.activeChatId].allowedDocs = [];
        saveChatSessions();
        renderChatKbDocsList();
        showToast('Đã bỏ chọn tất cả tài liệu (Chat trực tiếp Qwen không tra cứu tài liệu)', 'info');
      });
    }

    if (elements.btnUploadToChat && elements.chatKbFileInput) {
      elements.btnUploadToChat.addEventListener('click', () => {
        elements.chatKbFileInput.click();
      });

      elements.chatKbFileInput.addEventListener('change', async (e) => {
        if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          await uploadAndBindDocToChat(file);
          e.target.value = '';
        }
      });
    }
  }

  async function uploadAndBindDocToChat(file) {
    try {
      await uploadFileWithProgress(file, 'Chung', true);
    } catch (err) {
      console.warn('Upload to chat error:', err);
    }
  }

  // --- Recent Chats ---
  function loadRecentChats() {
    const saved = localStorage.getItem('researchmate_recent');
    if (saved) {
      try {
        state.recentChats = JSON.parse(saved);
      } catch (e) {}
    }
    renderRecentChats();
  }

  function addNewRecentChat(title) {
    const chatId = state.activeChatId || `chat-${Date.now()}`;
    state.activeChatId = chatId;

    if (!state.chatSessions[chatId]) {
      state.chatSessions[chatId] = {
        id: chatId,
        title: title,
        allowedDocs: ['all']
      };
    } else {
      state.chatSessions[chatId].title = title;
    }
    saveChatSessions();

    state.recentChats = (state.recentChats || []).filter(c => c.id !== chatId);
    state.recentChats.unshift({
      id: chatId,
      title: title,
      time: 'Vừa xong'
    });
    if (state.recentChats.length > 8) state.recentChats.pop();
    localStorage.setItem('researchmate_recent', JSON.stringify(state.recentChats));
    renderRecentChats();
  }

  function renderRecentChats() {
    if (!elements.recentChatsList) return;
    if (elements.kpiTotalChats) elements.kpiTotalChats.textContent = (state.recentChats || []).length;

    if (!state.recentChats || state.recentChats.length === 0) {
      elements.recentChatsList.innerHTML = `
        <div style="font-size: 0.78rem; color: var(--text-muted); padding: 1.25rem 0.5rem; text-align: center; line-height: 1.5;">
          <i class="fa-regular fa-comments" style="display: block; font-size: 1.2rem; margin-bottom: 0.35rem; opacity: 0.4;"></i>
          Chưa có cuộc trò chuyện.<br>Hãy đặt câu hỏi để bắt đầu!
        </div>
      `;
      return;
    }

    elements.recentChatsList.innerHTML = state.recentChats.map((c, idx) => `
      <div class="recent-item ${(c.id === state.activeChatId || (!state.activeChatId && idx === 0)) ? 'active' : ''}" data-id="${c.id}">
        <i class="fa-regular fa-message"></i>
        <div class="recent-item-meta">
          <span class="recent-title">${escapeHTML(c.title)}</span>
          <span class="recent-time">${escapeHTML(c.time)}</span>
        </div>
      </div>
    `).join('');

    elements.recentChatsList.querySelectorAll('.recent-item').forEach(item => {
      item.addEventListener('click', () => {
        elements.recentChatsList.querySelectorAll('.recent-item').forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        const chatId = item.getAttribute('data-id');
        if (chatId) {
          state.activeChatId = chatId;
          if (!state.chatSessions[chatId]) {
            state.chatSessions[chatId] = {
              id: chatId,
              title: item.querySelector('.recent-title')?.textContent || 'Hội thoại',
              allowedDocs: ['all']
            };
            saveChatSessions();
          }
          // Refresh the Knowledge Base checkboxes for this specific chat!
          renderChatKbDocsList();
        }
        switchView('chat');
      });
    });
  }

  // --- Colab Status & Connection Management ---
  function setupColabPanelEvents() {
    if (elements.btnPanelColabConnect) {
      elements.btnPanelColabConnect.addEventListener('click', async () => {
        const url = (elements.panelColabUrl?.value || '').trim();
        const user = (elements.panelColabUser?.value || '').trim();
        const pass = (elements.panelColabPass?.value || '').trim();
        await testAndConnectColab(url, user, pass);
      });
    }

    if (elements.btnPanelColabMock) {
      elements.btnPanelColabMock.addEventListener('click', async () => {
        const mockUrl = 'http://localhost:8080/api/mock-colab';
        if (elements.panelColabUrl) elements.panelColabUrl.value = mockUrl;
        if (elements.panelColabUser) elements.panelColabUser.value = 'admin';
        if (elements.panelColabPass) elements.panelColabPass.value = 'colab2026';
        await testAndConnectColab(mockUrl, 'admin', 'colab2026');
      });
    }
  }

  async function testAndConnectColab(url, user, pass) {
    if (!url) {
      showToast('Vui lòng nhập đường link Google Colab Tunnel URL', 'error');
      return;
    }
    showToast('Đang kết nối và kiểm tra GPU Colab...', 'info');
    try {
      const res = await fetch('/api/colab/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          colab_url: url,
          username: user || 'admin',
          password: pass || 'colab2026'
        })
      });
      const data = await res.json();
      if (res.ok && data.status === 'authenticated') {
        state.colabUrl = url;
        state.token = data.token || 'colab-auth-active';
        state.backendType = data.backend_type || (url.includes('gradio') ? 'gradio' : 'fastapi');
        localStorage.setItem('colab_url', url);
        localStorage.setItem('colab_user', user || 'triet');
        localStorage.setItem('colab_pass', pass || 'QwenFedora7392!');
        updateColabStatusUI();
        showToast('Kết nối Google Colab GPU thành công! (Tesla T4)', 'success');
      } else {
        throw new Error(data.detail || 'Không thể xác thực link Colab');
      }
    } catch (err) {
      showToast(`Lỗi kết nối Colab: ${err.message}`, 'error');
      updateColabStatusUI();
    }
  }

  function updateColabStatusUI() {
    const isMock = state.colabUrl && state.colabUrl.includes('mock');
    const isConfigured = Boolean(state.colabUrl && state.colabUrl.trim());

    if (elements.panelColabUrl && state.colabUrl) {
      elements.panelColabUrl.value = state.colabUrl;
    }
    if (elements.gatewayColabUrl && state.colabUrl) {
      elements.gatewayColabUrl.value = state.colabUrl;
    }
    if (elements.panelColabUser) {
      elements.panelColabUser.value = localStorage.getItem('colab_user') || 'triet';
    }
    if (elements.panelColabPass) {
      elements.panelColabPass.value = localStorage.getItem('colab_pass') || 'QwenFedora7392!';
    }
    if (elements.gatewayColabUser) {
      elements.gatewayColabUser.value = localStorage.getItem('colab_user') || 'triet';
    }
    if (elements.gatewayColabPass) {
      elements.gatewayColabPass.value = localStorage.getItem('colab_pass') || 'QwenFedora7392!';
    }

    if (elements.panelColabBanner && elements.panelColabBannerText) {
      if (isConfigured) {
        elements.panelColabBanner.className = 'colab-status-banner connected';
        elements.panelColabBannerText.innerHTML = `<i class="fa-solid fa-circle-check"></i> Đã kết nối: ${isMock ? 'Mock T4' : 'Google Colab GPU'}`;
      } else {
        elements.panelColabBanner.className = 'colab-status-banner disconnected';
        elements.panelColabBannerText.innerHTML = `<i class="fa-solid fa-circle-xmark"></i> Chưa kết nối Colab`;
      }
    }

    if (elements.topbarColabText) {
      elements.topbarColabText.textContent = isMock ? 'Colab (Mock Active)' : (isConfigured ? 'Colab GPU (Tesla T4)' : 'Chưa kết nối Colab');
    }
    if (elements.inspectorColabStatus) {
      elements.inspectorColabStatus.textContent = isMock ? 'Sẵn sàng (Mock T4)' : (isConfigured ? 'Sẵn sàng (Tesla T4)' : 'Chưa kết nối');
    }
    if (elements.dashConnectionStatus) {
      elements.dashConnectionStatus.innerHTML = `<i class="fa-solid fa-circle-check"></i> Google Colab GPU & RAG Cục bộ`;
    }
  }

  // --- Projects Management (100% Dynamic) ---
  function setupProjectsEvents() {
    if (elements.btnCreateProject) {
      elements.btnCreateProject.addEventListener('click', () => {
        if (elements.createProjectModal) elements.createProjectModal.style.display = 'flex';
      });
    }

    if (elements.btnCloseProjectModal) {
      elements.btnCloseProjectModal.addEventListener('click', () => {
        if (elements.createProjectModal) elements.createProjectModal.style.display = 'none';
      });
    }

    if (elements.btnCancelProjectModal) {
      elements.btnCancelProjectModal.addEventListener('click', () => {
        if (elements.createProjectModal) elements.createProjectModal.style.display = 'none';
      });
    }

    if (elements.createProjectForm) {
      elements.createProjectForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = (elements.inputNewProjectTitle?.value || '').trim();
        const desc = (elements.inputNewProjectDesc?.value || '').trim() || 'Dự án nghiên cứu & học phần học tập.';
        const iconType = elements.selectNewProjectIcon?.value || 'robot';

        if (!title) {
          showToast('Vui lòng nhập tên dự án!', 'error');
          return;
        }

        const colorMap = {
          robot: { icon: 'fa-robot', bg: 'bg-indigo' },
          database: { icon: 'fa-database', bg: 'bg-teal' },
          eye: { icon: 'fa-eye', bg: 'bg-orange' },
          briefcase: { icon: 'fa-briefcase', bg: 'bg-rose' },
          'graduation-cap': { icon: 'fa-graduation-cap', bg: 'bg-cyan' }
        };

        const chosen = colorMap[iconType] || { icon: 'fa-robot', bg: 'bg-indigo' };

        const newProj = {
          id: `proj-${Date.now()}`,
          title: title,
          desc: desc,
          iconClass: chosen.icon,
          bgClass: chosen.bg,
          docCount: 3,
          chatCount: 0,
          created: new Date().toLocaleDateString('vi-VN')
        };

        state.projects.unshift(newProj);
        localStorage.setItem('researchmate_projects', JSON.stringify(state.projects));
        renderProjects();
        if (elements.createProjectModal) elements.createProjectModal.style.display = 'none';
        elements.createProjectForm.reset();
        showToast(`Đã tạo dự án "${title}" thành công!`, 'success');
      });
    }
  }

  function loadProjects() {
    const saved = localStorage.getItem('researchmate_projects');
    if (saved) {
      try {
        state.projects = JSON.parse(saved);
      } catch (e) {
        state.projects = [];
      }
    }
    if (!state.projects || state.projects.length === 0) {
      state.projects = [
        {
          id: 'proj-1',
          title: 'Khoa học Dữ liệu & AI',
          desc: 'Nghiên cứu về đề án mở ngành Khoa học Dữ liệu, học máy và RAG.',
          iconClass: 'fa-robot',
          bgClass: 'bg-indigo',
          docCount: 3,
          chatCount: state.recentChats.length || 1
        },
        {
          id: 'proj-2',
          title: 'Nghiên cứu RAG từ Zero',
          desc: 'Embedding multilingual-e5, chunking văn bản và kiến trúc trích xuất ngữ cảnh.',
          iconClass: 'fa-database',
          bgClass: 'bg-teal',
          docCount: 2,
          chatCount: 4
        }
      ];
      localStorage.setItem('researchmate_projects', JSON.stringify(state.projects));
    }
    renderProjects();
  }

  function renderProjects() {
    if (!elements.projectsGridContainer) return;
    if (!state.projects || state.projects.length === 0) {
      elements.projectsGridContainer.innerHTML = `
        <div style="grid-column: 1 / -1; padding: 3rem 1rem; text-align: center; color: var(--text-muted);">
          <i class="fa-regular fa-folder-open" style="font-size: 2.2rem; opacity: 0.35; margin-bottom: 0.6rem; display: block;"></i>
          Chưa có dự án nào. Bấm "+ Tạo dự án" để tạo không gian nghiên cứu riêng!
        </div>
      `;
      return;
    }

    elements.projectsGridContainer.innerHTML = state.projects.map(p => `
      <div class="project-card" data-proj-id="${p.id}">
        <div class="project-card-header">
          <div class="project-icon ${p.bgClass || 'bg-indigo'}"><i class="fa-solid ${p.iconClass || 'fa-robot'}"></i></div>
          <span class="project-meta-count">${p.docCount || 3} tài liệu • ${p.chatCount || 0} cuộc trò chuyện</span>
        </div>
        <h3 class="project-title">${escapeHTML(p.title)}</h3>
        <p class="project-desc">${escapeHTML(p.desc)}</p>
        <div class="project-card-footer">
          <button type="button" class="btn-project-action open" data-action="chat" data-title="${escapeHTML(p.title)}">
            <i class="fa-regular fa-comment-dots"></i> Mở trò chuyện
          </button>
          <button type="button" class="btn-project-action delete" data-action="delete" data-id="${p.id}">
            <i class="fa-regular fa-trash-can"></i> Xóa
          </button>
        </div>
      </div>
    `).join('');

    elements.projectsGridContainer.querySelectorAll('.btn-project-action').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const action = btn.getAttribute('data-action');
        if (action === 'chat') {
          switchView('chat');
          const title = btn.getAttribute('data-title');
          elements.promptInput.value = `Hãy tóm tắt và hỗ trợ tôi các thông tin liên quan đến dự án ${title}`;
          elements.promptInput.focus();
        } else if (action === 'delete') {
          const id = btn.getAttribute('data-id');
          if (confirm('Bạn có chắc muốn xóa dự án này?')) {
            state.projects = state.projects.filter(p => p.id !== id);
            localStorage.setItem('researchmate_projects', JSON.stringify(state.projects));
            renderProjects();
            showToast('Đã xóa dự án!', 'info');
          }
        }
      });
    });
  }

  // --- Dashboard Live Activity Feed ---
  function loadActivityLog() {
    const saved = localStorage.getItem('researchmate_activity');
    if (saved) {
      try {
        state.activityLog = JSON.parse(saved);
      } catch (e) {
        state.activityLog = [];
      }
    }
    if (!state.activityLog || state.activityLog.length === 0) {
      state.activityLog = [
        {
          id: 1,
          query: 'Đề án mở ngành Khoa học Dữ liệu gồm những nội dung chính nào?',
          time: '15:30 • Hôm nay',
          sourcesCount: 3,
          score: 0.91
        },
        {
          id: 2,
          query: 'RAG từ Zero: Cơ chế kết hợp mô hình Embedding và Vector Store',
          time: '14:15 • Hôm nay',
          sourcesCount: 3,
          score: 0.88
        }
      ];
      localStorage.setItem('researchmate_activity', JSON.stringify(state.activityLog));
    }
    renderDashboardActivity();
  }

  function addActivityLog(query, sourcesCount, score) {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} • Hôm nay`;
    state.activityLog.unshift({
      id: Date.now(),
      query: query,
      time: timeStr,
      sourcesCount: sourcesCount || 0,
      score: score || 0.85
    });
    if (state.activityLog.length > 20) state.activityLog.pop();
    localStorage.setItem('researchmate_activity', JSON.stringify(state.activityLog));
    renderDashboardActivity();
  }

  function renderDashboardActivity() {
    if (!elements.dashActivityList) return;
    if (elements.dashActivityCount) {
      elements.dashActivityCount.textContent = `${state.activityLog.length} truy vấn`;
    }

    if (!state.activityLog || state.activityLog.length === 0) {
      elements.dashActivityList.innerHTML = `
        <div class="empty-activity-box">
          <i class="fa-regular fa-clock-rotate-left"></i>
          Chưa có nhật ký truy vấn nào.<br>Hãy đặt câu hỏi ở tab <strong>Chat</strong> để ghi lại hoạt động RAG!
        </div>
      `;
      return;
    }

    elements.dashActivityList.innerHTML = state.activityLog.map(act => `
      <div class="activity-feed-item">
        <div class="activity-item-header">
          <span class="activity-feed-query">${escapeHTML(act.query)}</span>
          <span class="activity-badge-time"><i class="fa-regular fa-clock"></i> ${escapeHTML(act.time)}</span>
        </div>
        <div class="activity-meta-tags">
          <span><i class="fa-solid fa-file-lines text-blue"></i> ${act.sourcesCount} đoạn trích RAG</span>
          <span>•</span>
          <span class="font-mono text-green"><i class="fa-solid fa-bullseye"></i> Cosine: ${act.score}</span>
        </div>
      </div>
    `).join('');
  }

  // --- Copy & Download ---
  function copyLastAIResponse() {
    const aiText = document.getElementById('ai-response-body')?.innerText || '';
    if (aiText) {
      navigator.clipboard.writeText(aiText);
      showToast('Đã sao chép nội dung câu trả lời!', 'success');
    }
  }

  function downloadMarkdownFile() {
    const aiText = document.getElementById('ai-response-body')?.innerText || '';
    if (!aiText) return;
    const blob = new Blob([aiText], { type: 'text/markdown;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `ResearchMate_${Date.now()}.md`;
    link.click();
    showToast('Đã tải tệp Markdown!', 'success');
  }

  // --- Toast Notification ---
  function showToast(msg, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    let icon = 'fa-circle-info';
    if (type === 'success') icon = 'fa-circle-check';
    if (type === 'error') icon = 'fa-triangle-exclamation';

    toast.innerHTML = `<i class="fa-solid ${icon}"></i><span>${escapeHTML(msg)}</span>`;
    elements.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  function escapeHTML(str) {
    return (str || '').replace(/[&<>'"]/g, 
      tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
  }

  // Start app
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
