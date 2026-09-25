const CONVERSATIONS_DATA = [
  {
    id: "conv_cafe",
    titleZh: "在咖啡店点单",
    titleVi: "Ở quán cà phê",
    icon: "☕",
    badgeZh: "高频场景",
    contextZh: "进入胡志明市一家充满法式风情的街头咖啡馆，向店员点一杯地道的越南冰奶咖啡。",
    dialogue: [
      {
        speakerZh: "店员",
        speakerVi: "Nhân viên",
        avatar: "👨‍💼",
        isLearner: false,
        vi: "Dạ xin chào anh! Anh muốn uống gì ạ?",
        zh: "您好先生！请问您想喝点什么？"
      },
      {
        speakerZh: "你 (顾客)",
        speakerVi: "Khách",
        avatar: "🙋‍♂️",
        isLearner: true,
        vi: "Cho tôi một ly cà phê sữa đá.",
        zh: "请给我一杯越南冰奶咖啡。"
      },
      {
        speakerZh: "店员",
        speakerVi: "Nhân viên",
        avatar: "👨‍💼",
        isLearner: false,
        vi: "Anh uống ngọt vừa hay ít đường ạ?",
        zh: "请问您要正常甜度还是少糖呢？"
      },
      {
        speakerZh: "你 (顾客)",
        speakerVi: "Khách",
        avatar: "🙋‍♂️",
        isLearner: true,
        vi: "Cho tôi ít đường và nhiều đá nhé.",
        zh: "请给我少糖，多放点冰块。"
      },
      {
        speakerZh: "店员",
        speakerVi: "Nhân viên",
        avatar: "👨‍💼",
        isLearner: false,
        vi: "Dạ được ạ. Anh uống ở đây hay mang đi ạ?",
        zh: "好的。请问您在店里喝还是打包带走？"
      },
      {
        speakerZh: "你 (顾客)",
        speakerVi: "Khách",
        avatar: "🙋‍♂️",
        isLearner: true,
        vi: "Tôi mang đi. Bao nhiêu tiền vậy bạn?",
        zh: "我打包带走。请问一共多少钱？"
      },
      {
        speakerZh: "店员",
        speakerVi: "Nhân viên",
        avatar: "👨‍💼",
        isLearner: false,
        vi: "Dạ của anh hết ba mươi nghìn đồng ạ.",
        zh: "先生，一共是三万越南盾（30k）。"
      },
      {
        speakerZh: "你 (顾客)",
        speakerVi: "Khách",
        avatar: "🙋‍♂️",
        isLearner: true,
        vi: "Gửi em tiền nhé. Cảm ơn em!",
        zh: "给你钱。谢谢你！"
      }
    ]
  },

  {
    id: "conv_meet",
    titleZh: "结识新朋友",
    titleVi: "Gặp người mới & Làm quen",
    icon: "🤝",
    badgeZh: "社交必备",
    contextZh: "在河内的一场跨国交流聚会上，认识了一位热情友好的越南新朋友 Hoa。",
    dialogue: [
      {
        speakerZh: "Hoa (越南朋友)",
        speakerVi: "Hoa",
        avatar: "👩",
        isLearner: false,
        vi: "Xin chào bạn! Bạn tên là gì thế?",
        zh: "你好呀！请问你叫什么名字呀？"
      },
      {
        speakerZh: "你",
        speakerVi: "Bạn",
        avatar: "🙋‍♂️",
        isLearner: true,
        vi: "Xin chào! Tôi tên là Lý Minh. Còn bạn?",
        zh: "你好！我叫李明。你呢？"
      },
      {
        speakerZh: "Hoa (越南朋友)",
        speakerVi: "Hoa",
        avatar: "👩",
        isLearner: false,
        vi: "Mình tên là Hoa. Rất vui được làm quen với bạn!",
        zh: "我叫 Hoa。非常高兴认识你！"
      },
      {
        speakerZh: "你",
        speakerVi: "Bạn",
        avatar: "🙋‍♂️",
        isLearner: true,
        vi: "Tôi cũng rất vui được gặp bạn. Bạn là người Hà Nội à?",
        zh: "我也很高兴认识你。你是河内本地人吗？"
      },
      {
        speakerZh: "Hoa (越南朋友)",
        speakerVi: "Hoa",
        avatar: "👩",
        isLearner: false,
        vi: "Đúng rồi, mình sinh ra ở Hà Nội. Bạn đến từ đâu?",
        zh: "对呀，我出生在河内。你来自哪里？"
      },
      {
        speakerZh: "你",
        speakerVi: "Bạn",
        avatar: "🙋‍♂️",
        isLearner: true,
        vi: "Tôi là người Trung Quốc, tôi mới đến Việt Nam.",
        zh: "我是中国人，我刚来越南不久。"
      },
      {
        speakerZh: "Hoa (越南朋友)",
        speakerVi: "Hoa",
        avatar: "👩",
        isLearner: false,
        vi: "Chào mừng bạn đến Việt Nam! Tiếng Việt của bạn rất tốt đấy!",
        zh: "欢迎你来到越南！你的越南语说得真不错呢！"
      }
    ]
  },

  {
    id: "conv_food",
    titleZh: "在餐馆吃河粉",
    titleVi: "Đi ăn phở tại quán",
    icon: "🍲",
    badgeZh: "美食打卡",
    contextZh: "中午走进一家香气扑鼻的传统老字号米粉店点餐。",
    dialogue: [
      {
        speakerZh: "店主阿姨",
        speakerVi: "Cô chủ quán",
        avatar: "👩‍🍳",
        isLearner: false,
        vi: "Cháu ơi, vào đây ngồi đi! Ăn phở gì cháu?",
        zh: "年轻人，快进来坐！吃什么粉呀？"
      },
      {
        speakerZh: "你",
        speakerVi: "Khách",
        avatar: "🙋‍♂️",
        isLearner: true,
        vi: "Dạ, cho cháu một tô phở bò tái nạm.",
        zh: "阿姨，请给我一碗生熟牛肉河粉。"
      },
      {
        speakerZh: "店主阿姨",
        speakerVi: "Cô chủ quán",
        avatar: "👩‍🍳",
        isLearner: false,
        vi: "Có ăn hành lá và giá đỗ không cháu?",
        zh: "吃葱花和豆芽吗？"
      },
      {
        speakerZh: "你",
        speakerVi: "Khách",
        avatar: "🙋‍♂️",
        isLearner: true,
        vi: "Dạ có ăn hành, nhưng đừng cho cay nhé cô.",
        zh: "要放葱，但请别放辣椒哦阿姨。"
      },
      {
        speakerZh: "店主阿姨",
        speakerVi: "Cô chủ quán",
        avatar: "👩‍🍳",
        isLearner: false,
        vi: "Được rồi, có ngay đây! Phở nóng hổi đây cháu ơi.",
        zh: "好的马上来！热腾腾的牛肉粉来喽。"
      },
      {
        speakerZh: "你",
        speakerVi: "Khách",
        avatar: "🙋‍♂️",
        isLearner: true,
        vi: "Phở ngon quá cô ơi! Tính tiền giúp cháu với.",
        zh: "粉太好吃了阿姨！请帮我结下账。"
      },
      {
        speakerZh: "店主阿姨",
        speakerVi: "Cô chủ quán",
        avatar: "👩‍🍳",
        isLearner: false,
        vi: "Tô của cháu bốn mươi lăm nghìn nhé.",
        zh: "你这碗一共四万五千盾（45k）哦。"
      }
    ]
  },

  {
    id: "conv_market",
    titleZh: "在市场购物砍价",
    titleVi: "Đi mua đồ ở chợ",
    icon: "🛍️",
    badgeZh: "市井购物",
    contextZh: "在滨城市场（Chợ Bến Thành）看中了一件手工传统纪念品与店主询价。",
    dialogue: [
      {
        speakerZh: "摊主姐姐",
        speakerVi: "Chị bán hàng",
        avatar: "👩‍🌾",
        isLearner: false,
        vi: "Em trai ơi, mua đồ lưu niệm đi em, đồ đẹp lắm!",
        zh: "小帅哥，买点纪念品吧，东西都很漂亮！"
      },
      {
        speakerZh: "你",
        speakerVi: "Bạn",
        avatar: "🙋‍♂️",
        isLearner: true,
        vi: "Chị ơi, cái nón lá này bao nhiêu tiền vậy?",
        zh: "大姐，这个斗笠多少钱呀？"
      },
      {
        speakerZh: "摊主姐姐",
        speakerVi: "Chị bán hàng",
        avatar: "👩‍🌾",
        isLearner: false,
        vi: "Cái nón này một trăm năm mươi nghìn em nhé.",
        zh: "这个斗笠十五万盾（150k）弟弟。"
      },
      {
        speakerZh: "你",
        speakerVi: "Bạn",
        avatar: "🙋‍♂️",
        isLearner: true,
        vi: "Đắt quá chị ơi! Bớt cho em một chút đi.",
        zh: "太贵了大姐！给我便宜一点嘛。"
      },
      {
        speakerZh: "摊主姐姐",
        speakerVi: "Chị bán hàng",
        avatar: "👩‍🌾",
        isLearner: false,
        vi: "Thế em mua được bao nhiêu?",
        zh: "那你出多少钱能买？"
      },
      {
        speakerZh: "你",
        speakerVi: "Bạn",
        avatar: "🙋‍♂️",
        isLearner: true,
        vi: "Một trăm nghìn được không chị? Em lấy luôn một cái.",
        zh: "十万盾（100k）可以吗大姐？我马上要一个。"
      },
      {
        speakerZh: "摊主姐姐",
        speakerVi: "Chị bán hàng",
        avatar: "👩‍🌾",
        isLearner: false,
        vi: "Thôi được rồi, mở hàng cho em vui vẻ nhé!",
        zh: "好吧好吧，图个开张好彩头卖给你啦！"
      }
    ]
  },

  {
    id: "conv_direction",
    titleZh: "街头问路",
    titleVi: "Hỏi đường trên phố",
    icon: "🗺️",
    badgeZh: "出行实用",
    contextZh: "在步行街寻找附近的知名地标，向路边执勤的交警或热心市民问路。",
    dialogue: [
      {
        speakerZh: "你",
        speakerVi: "Bạn",
        avatar: "🙋‍♂️",
        isLearner: true,
        vi: "Xin lỗi chú, cho cháu hỏi thăm đường với ạ.",
        zh: "不好意思叔叔，打扰一下请问路。"
      },
      {
        speakerZh: "热心大叔",
        speakerVi: "Người dân",
        avatar: "👨‍🦳",
        isLearner: false,
        vi: "Cháu muốn đi đâu thế?",
        zh: "你想去哪里呀？"
      },
      {
        speakerZh: "你",
        speakerVi: "Bạn",
        avatar: "🙋‍♂️",
        isLearner: true,
        vi: "Chợ Bến Thành ở đâu vậy chú? Có xa đây không?",
        zh: "请问滨城市场在哪里呀叔叔？离这儿远吗？"
      },
      {
        speakerZh: "热心大叔",
        speakerVi: "Người dân",
        avatar: "👨‍🦳",
        isLearner: false,
        vi: "Không xa đâu, cháu cứ đi thẳng đến ngã tư rồi rẽ trái.",
        zh: "不远，你一直往前直走到十字路口，然后左转。"
      },
      {
        speakerZh: "你",
        speakerVi: "Bạn",
        avatar: "🙋‍♂️",
        isLearner: true,
        vi: "Đi bộ khoảng mấy phút là tới ạ?",
        zh: "走路大概要几分钟能到呢？"
      },
      {
        speakerZh: "热心大叔",
        speakerVi: "Người dân",
        avatar: "👨‍🦳",
        isLearner: false,
        vi: "Đi bộ khoảng năm phút thôi cháu nhé.",
        zh: "走路大约五分钟就到啦孩子。"
      },
      {
        speakerZh: "你",
        speakerVi: "Bạn",
        avatar: "🙋‍♂️",
        isLearner: true,
        vi: "Cháu cảm ơn chú rất nhiều!",
        zh: "太感谢您了叔叔！"
      }
    ]
  },

  {
    id: "conv_office",
    titleZh: "办公室工作交流",
    titleVi: "Ở nơi làm việc",
    icon: "💼",
    badgeZh: "职场沟通",
    contextZh: "在越南分公司与越南本地同事 Nam 沟通项目进度与文件传递。",
    dialogue: [
      {
        speakerZh: "同事 Nam",
        speakerVi: "Nam",
        avatar: "🧑‍💻",
        isLearner: false,
        vi: "Chào Minh! Báo cáo dự án tuần này xong chưa bạn?",
        zh: "嗨阿明！这周的项目报告做好了吗？"
      },
      {
        speakerZh: "你",
        speakerVi: "Minh",
        avatar: "🙋‍♂️",
        isLearner: true,
        vi: "Mình vừa hoàn thành xong rồi. Mình gửi email cho bạn nhé?",
        zh: "我刚刚做好了。我现在发邮件给你好吗？"
      },
      {
        speakerZh: "同事 Nam",
        speakerVi: "Nam",
        avatar: "🧑‍💻",
        isLearner: false,
        vi: "Tuyệt vời quá! Chiều nay hai giờ chúng ta có cuộc họp nhé.",
        zh: "太棒了！今天下午两点我们开个会哦。"
      },
      {
        speakerZh: "你",
        speakerVi: "Minh",
        avatar: "🙋‍♂️",
        isLearner: true,
        vi: "Được chứ, mình sẽ chuẩn bị slide trình bày.",
        zh: "没问题，我会准备好演示幻灯片。"
      },
      {
        speakerZh: "同事 Nam",
        speakerVi: "Nam",
        avatar: "🧑‍💻",
        isLearner: false,
        vi: "Cảm ơn bạn nhiều nhé, có gì cần hỗ trợ cứ nhắn mình!",
        zh: "多谢你啦，有什么需要协助的随时给我发消息！"
      }
    ]
  },

  {
    id: "conv_friends",
    titleZh: "周末与朋友聊天相约",
    titleVi: "Nói chuyện với bạn bè",
    icon: "🎉",
    badgeZh: "轻松闲聊",
    contextZh: "周五下午下班后在微信或 Zalo 上与越南好友 Lan 相约周末活动。",
    dialogue: [
      {
        speakerZh: "Lan (朋友)",
        speakerVi: "Lan",
        avatar: "👱‍♀️",
        isLearner: false,
        vi: "Minh ơi! Cuối tuần này bạn có kế hoạch gì chưa?",
        zh: "阿明！这个周末你有什么安排了吗？"
      },
      {
        speakerZh: "你",
        speakerVi: "Minh",
        avatar: "🙋‍♂️",
        isLearner: true,
        vi: "Mình chưa có kế hoạch gì cả. Có chuyện gì vui không?",
        zh: "我还没什么安排呢。有什么好玩的事吗？"
      },
      {
        speakerZh: "Lan (朋友)",
        speakerVi: "Lan",
        avatar: "👱‍♀️",
        isLearner: false,
        vi: "Thứ bảy này tụi mình đi cà phê rồi đi dạo phố đi bộ nhé!",
        zh: "这周六我们一起去喝咖啡，然后去步行街散步吧！"
      },
      {
        speakerZh: "你",
        speakerVi: "Minh",
        avatar: "🙋‍♂️",
        isLearner: true,
        vi: "Ý kiến hay quá! Mấy giờ mình gặp nhau được nhỉ?",
        zh: "好主意！我们几点见面合适呢？"
      },
      {
        speakerZh: "Lan (朋友)",
        speakerVi: "Lan",
        avatar: "👱‍♀️",
        isLearner: false,
        vi: "Khoảng bốn giờ chiều nhé, lúc đó trời mát mẻ hơn.",
        zh: "大概下午四点吧，那时候天气比较凉爽。"
      },
      {
        speakerZh: "你",
        speakerVi: "Minh",
        avatar: "🙋‍♂️",
        isLearner: true,
        vi: "Được, hẹn gặp bạn thứ bảy nhé!",
        zh: "好的，周六不见不散！"
      }
    ]
  }
];
