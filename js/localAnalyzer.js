(function () {
  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  function estimateDurationSeconds(file) {
    const sizeMB = file.size / (1024 * 1024);
    return Math.max(5, Math.round(sizeMB * 1.5));
  }

  function buildKeywordFrequencies(name) {
    const baseWords = ['النادي', 'اللاعب', 'مباراة', 'تدريب', 'تسجيل', 'تحليل', 'أداء', 'تكتيك', 'دقيقة', 'هدف'];
    const words = [...baseWords, ...(name ? name.split(/[\s\-_\.]+/).filter(Boolean) : [])];
    const frequencies = {};
    for (const w of words) {
      const normalized = String(w).toLowerCase();
      frequencies[normalized] = (frequencies[normalized] || 0) + Math.floor(Math.random() * 3) + 1;
    }
    return frequencies;
  }

  function randomPick(array) {
    return array[Math.floor(Math.random() * array.length)];
  }

  function generateParticipants() {
    const names = ['أحمد', 'فاطمة', 'محمد', 'سارة', 'خالد', 'نور', 'عمر', 'ليلى', 'مريم', 'يزن'];
    const roles = ['رئيس النادي', 'نائب الرئيس', 'مسؤول الإعلام', 'مسؤول الإنتاج', 'عضو', 'عضو', 'عضو'];
    const count = 5 + Math.floor(Math.random() * 4);
    const participants = [];
    for (let i = 0; i < count; i++) {
      participants.push({ name: randomPick(names) + ' ' + (100 + Math.floor(Math.random() * 900)), role: randomPick(roles) });
    }
    return participants;
  }

  function generateAgenda() {
    const topics = ['مراجعة المحتوى الأسبوعي', 'خطة التغطيات القادمة', 'التجهيز للبودكاست', 'تقارير منصات التواصل', 'توزيع المهام', 'الميزانية والمشتريات'];
    const items = [];
    const n = 3 + Math.floor(Math.random() * 3);
    for (let i = 0; i < n; i++) {
      items.push({
        topic: randomPick(topics),
        timeAllocatedMin: 10 + Math.floor(Math.random() * 15),
        notes: 'نقاش حول ' + randomPick(topics).toLowerCase()
      });
    }
    return items;
  }

  function generateDecisions(participants) {
    const decisions = [];
    const texts = ['اعتماد جدول النشر', 'الموافقة على تصوير فعالية', 'تأجيل حلقة البودكاست', 'تحديث دليل الهوية البصرية'];
    const n = 2 + Math.floor(Math.random() * 2);
    for (let i = 0; i < n; i++) {
      const yes = 4 + Math.floor(Math.random() * 6);
      const no = Math.floor(Math.random() * 3);
      const abstain = Math.floor(Math.random() * 2);
      decisions.push({
        description: randomPick(texts),
        rationale: 'مبني على مؤشرات التفاعل والموارد المتاحة',
        vote: { yes, no, abstain },
        approved: yes > no,
        timestamp: new Date().toISOString(),
        owner: randomPick(participants)?.name || '—'
      });
    }
    return decisions;
  }

  function generateActionItems(participants) {
    const tasks = ['إعداد خطة التغطية', 'حجز معدات التصوير', 'تصميم مواد النشر', 'تسجيل الحلقة الأولى', 'تحديث تقويم النشر'];
    const priorities = ['مرتفعة', 'متوسطة', 'منخفضة'];
    const items = [];
    const n = 3 + Math.floor(Math.random() * 3);
    for (let i = 0; i < n; i++) {
      items.push({
        task: randomPick(tasks),
        assignee: randomPick(participants)?.name || '—',
        dueDate: new Date(Date.now() + (3 + Math.floor(Math.random() * 10)) * 86400000).toISOString().slice(0, 10),
        priority: randomPick(priorities),
        status: 'مفتوح'
      });
    }
    return items;
  }

  function generateMeetingReport(kind, file) {
    const participants = generateParticipants();
    return {
      meta: {
        title: 'اجتماع نادي الإعلام الجامعي',
        clubName: 'نادي الإعلام',
        date: new Date().toISOString().slice(0, 16),
        location: 'قاعة الاجتماعات A',
        moderator: participants[0]?.name || '—',
        recorder: participants[1]?.name || '—',
        sourceType: kind === 'video' ? 'فيديو' : 'صوت',
        sourceFile: file.name
      },
      participants,
      agenda: generateAgenda(),
      discussionHighlights: [
        { time: '00:03:15', note: 'عرض مؤشرات الأداء لمنصات التواصل.' },
        { time: '00:12:40', note: 'نقاش حول تغطية فعالية الأسبوع القادم.' },
        { time: '00:25:10', note: 'اقتراح سلسلة بودكاست للطلاب الجدد.' }
      ],
      decisions: generateDecisions(participants),
      actionItems: generateActionItems(participants),
      risks: [
        { risk: 'نقص المتطوعين للتغطية الميدانية', mitigation: 'فتح تسجيل سريع وتنسيق مع الأندية الشريكة' },
        { risk: 'تعارض مواعيد التسجيل مع الامتحانات', mitigation: 'جدولة بديلة وتسجيل مسبق' }
      ],
      resources: [
        { label: 'دليل الهوية البصرية', url: 'https://example.com/brand-guide' },
        { label: 'قالب خطة النشر', url: 'https://example.com/publishing-plan' }
      ],
      editableNotes: 'أضف ملاحظات إضافية هنا.'
    };
  }

  async function analyze({ type, file, onProgress }) {
    const totalSteps = 20;
    for (let step = 1; step <= totalSteps; step++) {
      const pct = Math.round((step / totalSteps) * 100);
      onProgress?.(pct, step < totalSteps ? 'جاري التحليل...' : 'إنهاء التحليل');
      await sleep(90 + Math.random() * 120);
    }

    const durationSec = estimateDurationSeconds(file);
    const wordFreq = buildKeywordFrequencies(file.name);
    const top = Object.entries(wordFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);

    const labels = top.map(([k]) => k);
    const values = top.map(([, v]) => v);

    const transcript = [
      'مرحبًا بك في تقرير التحليل المحلي.',
      'تم تحليل الملف بدون إنترنت أو API.',
      type === 'video' ? 'تم تفسير المحتوى كفيديو.' : 'تم تفسير المحتوى كصوت.',
      'هذه نتائج أولية لأغراض العرض فقط.'
    ];

    const meetingReport = generateMeetingReport(type, file);

    return {
      summary: {
        fileName: file.name,
        kind: type,
        mimeType: file.type || 'غير معروف',
        sizeMB: +(file.size / (1024 * 1024)).toFixed(2),
        durationSec
      },
      metrics: {
        keywordFrequencies: wordFreq
      },
      chartsData: {
        keywords: { labels, values }
      },
      transcript,
      meetingReport
    };
  }

  window.localAnalyzer = { analyze };
})();