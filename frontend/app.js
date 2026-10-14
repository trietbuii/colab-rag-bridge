/**
 * ResearchMate - Your AI Research Assistant
 * Client Logic cho giao diện 3 cột phong cách Sáng (Light Theme) hiện đại
 */

(function () {
  'use strict';

  // --- App State ---
  const state = {
    colabUrl: localStorage.getItem('colab_url') || 'https://6a000f9cfeae6b5ad6.gradio.live',
    backendType: 'gradio',
    token: 'auth-session-active',
    selectedModel: localStorage.getItem('selected_model') || 'qwen3-4b',
    availableDocs: [],
    activeChatId: 'chat-default',
    chatSessions: {},
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
    tabRelDocs: document.getElementById('tab-rel-docs'),
    tabSysInfo: document.getElementById('tab-sys-info'),
    paneSources: document.getElementById('pane-sources'),
    paneInfo: document.getElementById('pane-info'),
    chatKbScopeCard: document.getElementById('chat-kb-scope-card'),
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
    kbSearchBox: document.getElementById('kb-search-box'),
    kbFilterTabs: document.querySelectorAll('.filter-tab'),
    sidebarKbCount: document.getElementById('sidebar-kb-count'),
    kpiTotalDocs: document.getElementById('kpi-total-docs'),
    kpiTotalSize: document.getElementById('kpi-total-size'),
    kpiTotalChunks: document.getElementById('kpi-total-chunks'),
    kpiTotalChats: document.getElementById('kpi-total-chats'),
    dashModelName: document.getElementById('dash-model-name'),
    dashConnectionStatus: document.getElementById('dash-connection-status'),
    dashActivityList: document.getElementById('dash-activity-list'),
    dashActivityCount: document.getElementById('dash-activity-count'),

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

    // Settings
    topKButtons: document.querySelectorAll('.btn-chunk-k'),
    sliderThreshold: document.getElementById('slider-threshold'),
    labelThresholdVal: document.getElementById('label-threshold-val'),
    sliderTemperature: document.getElementById('slider-temperature'),
    labelTemperatureVal: document.getElementById('label-temperature-val'),
    btnSetLightTheme: document.getElementById('btn-set-light-theme'),
    btnSetDarkTheme: document.getElementById('btn-set-dark-theme'),

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
    loadChatSessions();
    setupNavigation();
    setupChatEvents();
    setupChatKbEvents();
    setupRightPanelTabs();
    setupSettingsEvents();
    setupKnowledgeBase();
    setupProjectsEvents();
    setupColabPanelEvents();
    updateColabStatusUI();
    loadRagStatus();
    loadRecentChats();
    loadProjects();
    loadActivityLog();
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
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
      if (elements.themeToggleIcon) elements.themeToggleIcon.className = 'fa-solid fa-sun';
      if (elements.btnSetLightTheme) elements.btnSetLightTheme.classList.add('active');
      if (elements.btnSetDarkTheme) elements.btnSetDarkTheme.classList.remove('active');
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
        switchView('settings');
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

  // --- Right Panel Inspector ---
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
    elements.btnUploadNewDoc.addEventListener('click', () => {
      elements.kbViewUploadInput.click();
    });

    elements.kbViewUploadInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        uploadFileToKnowledgeBase(e.target.files[0]);
      }
    });

    elements.btnReindexKbView.addEventListener('click', reindexKnowledgeBase);

    // Search filter
    elements.kbSearchBox.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase();
      const rows = elements.kbFullTableBody.querySelectorAll('tr');
      rows.forEach(r => {
        const text = r.innerText.toLowerCase();
        r.style.display = text.includes(q) ? '' : 'none';
      });
    });

    // Tab filter
    elements.kbFilterTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        elements.kbFilterTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const ext = tab.getAttribute('data-ext');
        const rows = elements.kbFullTableBody.querySelectorAll('tr');
        rows.forEach(r => {
          if (ext === 'all') {
            r.style.display = '';
          } else {
            const rowExt = r.getAttribute('data-ext');
            r.style.display = (rowExt === ext) ? '' : 'none';
          }
        });
      });
    });
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

        renderKbTable(files);
      }
    } catch (e) {
      console.warn('Status error:', e);
    }
  }

  function renderKbTable(files) {
    if (!elements.kbFullTableBody) return;
    if (files.length === 0) {
      elements.kbFullTableBody.innerHTML = `
        <tr>
          <td colspan="6" style="padding: 2rem; text-align: center; color: var(--text-muted);">
            Kho tri thức data/raw/ chưa có tài liệu. Bấm "+ Thêm tài liệu" để tải lên!
          </td>
        </tr>
      `;
      return;
    }

    elements.kbFullTableBody.innerHTML = files.map(f => {
      const ext = f.ext || 'txt';
      const icon = ext === 'pdf' ? 'fa-regular fa-file-pdf text-red' : (ext === 'md' ? 'fa-regular fa-file-code text-blue' : 'fa-regular fa-file-lines text-purple');
      return `
        <tr data-ext="${ext}">
          <td style="font-weight: 700;">
            <i class="${icon}" style="margin-right: 0.5rem;"></i>
            ${escapeHTML(f.name)}
          </td>
          <td><span class="badge-num" style="text-transform: uppercase;">${ext}</span></td>
          <td class="font-mono text-muted">${f.size_kb} KB</td>
          <td class="text-muted">${escapeHTML(f.mtime)}</td>
          <td>
            <span class="status-badge-live"><i class="fa-solid fa-check"></i> Đã nạp Vector</span>
          </td>
          <td style="text-align: center;">
            <button type="button" class="msg-action-btn btn-delete-file" data-name="${escapeHTML(f.name)}" title="Xóa tài liệu này">
              <i class="fa-regular fa-trash-can" style="color: #ef4444;"></i>
            </button>
          </td>
        </tr>
      `;
    }).join('');

    // Attach delete handlers
    elements.kbFullTableBody.querySelectorAll('.btn-delete-file').forEach(btn => {
      btn.addEventListener('click', () => {
        const fname = btn.getAttribute('data-name');
        if (confirm(`Bạn có chắc muốn xóa "${fname}" khỏi kho tri thức?`)) {
          deleteDocument(fname);
        }
      });
    });
  }

  async function uploadFileToKnowledgeBase(file) {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        showToast(`Đang nạp ${file.name} vào kho tri thức...`, 'info');
        const res = await fetch('/api/rag/upload-file', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            filename: file.name,
            content_base64: e.target.result
          })
        });
        const data = await res.json();
        if (res.ok) {
          showToast(`Đã thêm thành công ${file.name}!`, 'success');
          loadRagStatus();
        } else {
          throw new Error(data.detail || 'Lỗi nạp file');
        }
      } catch (err) {
        showToast(`Lỗi: ${err.message}`, 'error');
      }
    };
    reader.readAsDataURL(file);
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

  // --- Settings View Events ---
  function setupSettingsEvents() {
    elements.topKButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        elements.topKButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.topK = parseInt(btn.getAttribute('data-k'), 10);
      });
    });

    elements.sliderThreshold.addEventListener('input', (e) => {
      state.similarityThreshold = parseFloat(e.target.value);
      elements.labelThresholdVal.textContent = state.similarityThreshold.toFixed(2);
    });

    elements.sliderTemperature.addEventListener('input', (e) => {
      state.temperature = parseFloat(e.target.value);
      elements.labelTemperatureVal.textContent = state.temperature.toFixed(2);
    });

    elements.btnSetLightTheme.addEventListener('click', () => applyTheme('light'));
    elements.btnSetDarkTheme.addEventListener('click', () => applyTheme('dark'));
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

    let activeCount = 0;
    elements.chatKbDocsList.innerHTML = state.availableDocs.map(doc => {
      const name = doc.name || doc;
      const isChecked = isAll || allowed.some(a => a.toLowerCase() === name.toLowerCase());
      if (isChecked) activeCount++;
      const ext = (doc.ext || name.split('.').pop() || 'txt').toUpperCase();

      return `
        <label class="chat-kb-doc-item" title="${escapeHTML(name)}">
          <input type="checkbox" class="chat-kb-checkbox" data-doc="${escapeHTML(name)}" ${isChecked ? 'checked' : ''}>
          <i class="fa-regular ${ext === 'PDF' ? 'fa-file-pdf text-red' : 'fa-file-lines text-blue'}"></i>
          <span class="doc-name">${escapeHTML(name)}</span>
          <span class="doc-badge">${escapeHTML(ext)}</span>
        </label>
      `;
    }).join('');

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
        }
      });
    }
  }

  async function uploadAndBindDocToChat(file) {
    showToast(`Đang tải lên và nạp [${file.name}] vào Knowledge Base...`, 'info');
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const payload = {
          name: file.name,
          base64: evt.target.result
        };
        const res = await fetch('/api/rag/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const d = await res.json();
        if (res.ok) {
          showToast(`Đã nạp ${file.name} thành công (${d.chunks_created || 0} chunks)!`, 'success');
          await loadRagStatus();

          // Bind this file specifically to active chat
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
        } else {
          showToast(d.detail || 'Lỗi nạp tệp', 'error');
        }
      } catch (err) {
        showToast(err.message, 'error');
      }
    };
    reader.readAsDataURL(file);
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
