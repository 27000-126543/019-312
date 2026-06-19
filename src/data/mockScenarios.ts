import { ActionMeta, ActionType, ScenarioResult } from '@/types';

export const actionMetas: ActionMeta[] = [
  {
    type: 'silence',
    label: '继续沉默',
    description: '暂不对外表态，观察事态发展',
    icon: 'volume-x',
  },
  {
    type: 'customer_service',
    label: '客服解释',
    description: '通过客服渠道一对一沟通安抚',
    icon: 'headphones',
  },
  {
    type: 'official_statement',
    label: '官方声明',
    description: '通过官网/官微发布正式声明',
    icon: 'megaphone',
  },
  {
    type: 'business_rectification',
    label: '业务整改',
    description: '内部流程整改 + 对外公布措施',
    icon: 'wrench',
  },
];

export const scenarioResults: Record<string, Record<ActionType, ScenarioResult>> = {
  'evt-001': {
    silence: {
      action: 'silence',
      publicReaction: {
        trend: 'negative',
        description: '沉默被解读为"默认理亏"，预计热度继续攀升，48小时内可能冲上全国热搜前20。',
        sentimentScore: -65,
      },
      regulatoryRisk: {
        probability: 85,
        description: '高概率触发银保监消费者权益保护局的关注，可能被要求提交书面说明。',
      },
      customerTrust: {
        impact: 'highly_negative',
        description: '老年客群信任度预计下降15-20%，可能引发更多同类投诉。',
        changePercent: -18,
      },
      expertAdvice: '强烈不建议沉默。此类涉及弱势群体的事件，沉默是最差选择，只会让公众认为"店大欺客"。',
    },
    customer_service: {
      action: 'customer_service',
      publicReaction: {
        trend: 'neutral',
        description: '一对一沟通可安抚当事客户，但已有舆情不会自动平息，仍有扩散风险。',
        sentimentScore: -10,
      },
      regulatoryRisk: {
        probability: 50,
        description: '若能与客户达成和解并取得谅解书，可降低监管介入概率。',
      },
      customerTrust: {
        impact: 'negative',
        description: '当事客户可能挽回，但已看到帖子的潜在客户信心受损。',
        changePercent: -7,
      },
      expertAdvice: '客服沟通是必要步骤，但不应是全部。建议配合公开发声，双管齐下。',
    },
    official_statement: {
      action: 'official_statement',
      publicReaction: {
        trend: 'neutral',
        description: '及时、诚恳的声明可阻止舆情恶化，舆论将转向"看后续处理结果"。',
        sentimentScore: 5,
      },
      regulatoryRisk: {
        probability: 30,
        description: '主动表态并承诺调查，监管通常会给银行自行处理的空间。',
      },
      customerTrust: {
        impact: 'neutral',
        description: '主动发声可展现负责任的态度，避免信任进一步流失。',
        changePercent: -2,
      },
      expertAdvice: '建议采取此方案。声明要点：1.高度重视；2.立即调查；3.保护客户权益；4.后续通报结果。措辞要诚恳，避免"甩锅"。',
    },
    business_rectification: {
      action: 'business_rectification',
      publicReaction: {
        trend: 'positive',
        description: '除了解决本次事件，更展现"举一反三"的态度，可将危机转化为品牌加分项。',
        sentimentScore: 25,
      },
      regulatoryRisk: {
        probability: 10,
        description: '主动整改并对外公布，监管通常会给予正面评价。',
      },
      customerTrust: {
        impact: 'positive',
        description: '展现负责任的大行形象，甚至可能提升客户信任度。',
        changePercent: 8,
      },
      expertAdvice: '最佳方案。建议：先安抚客户+发表声明，随后3天内公布销售规范整改措施，将"危"转化为"机"。',
    },
  },
  'evt-002': {
    silence: {
      action: 'silence',
      publicReaction: {
        trend: 'negative',
        description: '用户会因"连个说法都没有"而更加愤怒，可能引发集体投诉。',
        sentimentScore: -45,
      },
      regulatoryRisk: {
        probability: 60,
        description: '若出现大面积用户投诉，可能触发信息科技风险监管关注。',
      },
      customerTrust: {
        impact: 'negative',
        description: '系统不稳定+无回应，APP活跃率预计短期下降8-10%。',
        changePercent: -10,
      },
      expertAdvice: '技术故障不可怕，可怕的是不回应。建议至少发一个简短通知。',
    },
    customer_service: {
      action: 'customer_service',
      publicReaction: {
        trend: 'neutral',
        description: '主动联系用户可安抚情绪，但覆盖面有限，未被联系的用户仍可能不满。',
        sentimentScore: -5,
      },
      regulatoryRisk: {
        probability: 35,
        description: '有主动服务记录，即使监管介入也可视作积极应对。',
      },
      customerTrust: {
        impact: 'neutral',
        description: '被联系用户满意度较高，但整体用户感知改善有限。',
        changePercent: -3,
      },
      expertAdvice: '客服沟通是基础，但覆盖面不够。建议配合APP弹窗和短信通知。',
    },
    official_statement: {
      action: 'official_statement',
      publicReaction: {
        trend: 'positive',
        description: '公开致歉+说明原因+告知恢复进度，大部分用户表示理解。',
        sentimentScore: 30,
      },
      regulatoryRisk: {
        probability: 15,
        description: '主动向用户说明并致歉，符合监管对消费者权益保护的要求。',
      },
      customerTrust: {
        impact: 'positive',
        description: '诚恳的声明反而能让用户感受到被重视，信任损失可控制在最小范围。',
        changePercent: 3,
      },
      expertAdvice: '建议选择此方案。技术故障用户有预期，关键是沟通透明度。建议同步提供手续费减免补偿。',
    },
    business_rectification: {
      action: 'business_rectification',
      publicReaction: {
        trend: 'positive',
        description: '若能公布具体的技术升级和保障措施，可展现科技硬实力。',
        sentimentScore: 35,
      },
      regulatoryRisk: {
        probability: 5,
        description: '主动整改并加强技术保障，监管层面零风险。',
      },
      customerTrust: {
        impact: 'positive',
        description: '用行动证明重视用户体验，长期来看增强技术品牌信任。',
        changePercent: 6,
      },
      expertAdvice: '建议"声明+轻整改"组合：先发布声明和补偿方案，后续内部加强测试流程，不必对外大张旗鼓整改。',
    },
  },
  'evt-003': {
    silence: {
      action: 'silence',
      publicReaction: {
        trend: 'negative',
        description: '媒体会因"不回应"而倾向于采信爆料内容，报道角度更负面。',
        sentimentScore: -55,
      },
      regulatoryRisk: {
        probability: 70,
        description: '涉及销售合规的爆料，若不主动澄清，监管可能启动核查。',
      },
      customerTrust: {
        impact: 'negative',
        description: '可能影响有理财需求的客户选择，担忧"被强推产品"。',
        changePercent: -9,
      },
      expertAdvice: '不建议沉默。媒体已介入，必须有正式回应口径。',
    },
    customer_service: {
      action: 'customer_service',
      publicReaction: {
        trend: 'neutral',
        description: '内部沟通无法解决外部媒体报道问题，效果有限。',
        sentimentScore: -20,
      },
      regulatoryRisk: {
        probability: 65,
        description: '外部舆情已形成，仅内部沟通不足以消除监管疑虑。',
      },
      customerTrust: {
        impact: 'negative',
        description: '公众看不到积极应对，负面影响持续存在。',
        changePercent: -7,
      },
      expertAdvice: '此方案不适用当前场景。这是外部舆情，不是客户服务问题。',
    },
    official_statement: {
      action: 'official_statement',
      publicReaction: {
        trend: 'neutral',
        description: '回应可暂时压制不实传言，但匿名帖的持续发酵可能让公众将信将疑。',
        sentimentScore: 0,
      },
      regulatoryRisk: {
        probability: 35,
        description: '有正式回应表明银行已关注并处理，监管介入概率降低。',
      },
      customerTrust: {
        impact: 'neutral',
        description: '及时回应避免了最坏情况，但要完全消除疑虑需要更多证据。',
        changePercent: -2,
      },
      expertAdvice: '建议采取"回应+核查"模式。回应口径：重视此问题，已启动内部核查，如有问题严肃处理，如无问题也将澄清。避免直接定性为"造谣"。',
    },
    business_rectification: {
      action: 'business_rectification',
      publicReaction: {
        trend: 'positive',
        description: '借此时机全面梳理销售合规流程并对外披露，可化被动为主动。',
        sentimentScore: 20,
      },
      regulatoryRisk: {
        probability: 15,
        description: '主动开展合规检查，体现负责任态度，监管会给予正面评价。',
      },
      customerTrust: {
        impact: 'positive',
        description: '让客户看到银行对合规的重视，反而提升信任。',
        changePercent: 5,
      },
      expertAdvice: '建议此方案。可同步启动分行专项审计，审计结果若属实则整改+问责，若不实则公开澄清+加强员工权益保障，两种结果都对银行有利。',
    },
  },
};

export function getScenarioResult(eventId: string, action: ActionType): ScenarioResult | null {
  const eventScenarios = scenarioResults[eventId];
  if (!eventScenarios) return null;
  return eventScenarios[action] || null;
}
