// 10 门越南语新手核心课程数据 (10 Bài học tiếng Việt cho người mới bắt đầu)
// 每个课程包含：1. 词汇学习 (Vocabulary) -> 2. 核心句型 (Key Sentences) -> 3. 听力辨音 (Listening) -> 4. 课后小测 (Quiz)

const LESSONS_DATA = [
  {
    id: 1,
    lessonNumber: "01",
    titleZh: "问候与基本礼貌",
    titleVi: "Chào hỏi & Lịch sự",
    icon: "👋",
    duration: "5 分钟",
    level: "零基础入门",
    summaryZh: "掌握越南人日常中最常用的问候、感谢与礼貌道歉用语。",
    vocabularies: [
      {
        vi: "Xin chào",
        zh: "你好 / 您好",
        noteZh: "最通用的打招呼方式，适合各种场合",
        exampleVi: "Xin chào bạn!",
        exampleZh: "你好，朋友！"
      },
      {
        vi: "Cảm ơn",
        zh: "谢谢",
        noteZh: "发音与中文粤语/客家话'感恩'非常相近",
        exampleVi: "Cảm ơn bạn rất nhiều.",
        exampleZh: "非常感谢你。"
      },
      {
        vi: "Xin lỗi",
        zh: "对不起 / 不好意思",
        noteZh: "可以用于道歉或打扰别人前引出话题",
        exampleVi: "Xin lỗi, cho tôi hỏi.",
        exampleZh: "不好意思，打扰一下请问。"
      },
      {
        vi: "Tạm biệt",
        zh: "再见",
        noteZh: "与汉字'暂别'同源",
        exampleVi: "Tạm biệt, hẹn gặp lại!",
        exampleZh: "再见，回头见！"
      },
      {
        vi: "Không có gì",
        zh: "不客气 / 没关系",
        noteZh: "当别人对你说 Cảm ơn 时最自然的回应",
        exampleVi: "Dạ không có gì ạ.",
        exampleZh: "没事，不用客气。"
      }
    ],
    sentences: [
      {
        vi: "Xin chào, bạn khỏe không?",
        zh: "你好，你身体好吗？/ 你最近好吗？",
        breakdown: "Xin chào (你好) + bạn (你) + khỏe không (身体好吗)"
      },
      {
        vi: "Tôi khỏe, cảm ơn bạn.",
        zh: "我很好，谢谢你。",
        breakdown: "Tôi (我) + khỏe (健康/好) + cảm ơn (谢谢) + bạn (你)"
      },
      {
        vi: "Rất vui được gặp bạn.",
        zh: "很高兴见到你。",
        breakdown: "Rất (很) + vui (高兴) + được (得以) + gặp (见) + bạn (你)"
      }
    ],
    quizzes: [
      {
        question: "在越南语中，“谢谢”怎么说？",
        options: ["Xin chào", "Cảm ơn", "Xin lỗi", "Tạm biệt"],
        answer: 1,
        explanation: "“Cảm ơn” 是越南语中的“谢谢”，词源来自古汉语“感恩”。"
      },
      {
        question: "当别人对你说了“Cảm ơn”，最地道的回复是：",
        options: ["Không có gì", "Tạm biệt", "Xin lỗi", "Xin chào"],
        answer: 0,
        explanation: "“Không có gì” 意为“没有什么”，即“不客气 / 别客气”。"
      },
      {
        question: "“Xin lỗi” 在中文里的意思是什么？",
        options: ["你好", "谢谢", "对不起 / 抱歉", "明天见"],
        answer: 2,
        explanation: "“Xin lỗi” 是最常用的道歉语，相当于“对不起”。"
      }
    ]
  },

  {
    id: 2,
    lessonNumber: "02",
    titleZh: "自我介绍",
    titleVi: "Giới thiệu bản thân",
    icon: "🤝",
    duration: "6 分钟",
    level: "初级入门",
    summaryZh: "学会介绍自己的名字、来自哪里以及职业称呼。",
    vocabularies: [
      {
        vi: "Tôi",
        zh: "我",
        noteZh: "通用的第一人称代词",
        exampleVi: "Tôi là người Trung Quốc.",
        exampleZh: "我是中国人。"
      },
      {
        vi: "Tên là",
        zh: "名叫 / 名字是",
        noteZh: "Tên (名字) + là (是)",
        exampleVi: "Tôi tên là Lý Minh.",
        exampleZh: "我名叫李明。"
      },
      {
        vi: "Người Trung Quốc",
        zh: "中国人",
        noteZh: "Người (人) + Trung Quốc (中国)",
        exampleVi: "Tôi là người Trung Quốc.",
        exampleZh: "我是中国人。"
      },
      {
        vi: "Người Việt Nam",
        zh: "越南人",
        noteZh: "Người (人) + Việt Nam (越南)",
        exampleVi: "Bạn là người Việt Nam phải không?",
        exampleZh: "你是越南人对吗？"
      },
      {
        vi: "Học sinh / Sinh viên",
        zh: "学生 / 大学生",
        noteZh: "Sinh viên 专门指大学生",
        exampleVi: "Tôi là sinh viên.",
        exampleZh: "我是大学生。"
      }
    ],
    sentences: [
      {
        vi: "Bạn tên là gì?",
        zh: "你叫什么名字？",
        breakdown: "Bạn (你) + tên là (名叫) + gì (什么)"
      },
      {
        vi: "Tôi tên là...",
        zh: "我叫……",
        breakdown: "Tôi (我) + tên là (叫) + 姓名"
      },
      {
        vi: "Tôi đến từ Bắc Kinh.",
        zh: "我来自北京。",
        breakdown: "Tôi (我) + đến từ (来自) + Bắc Kinh (北京)"
      }
    ],
    quizzes: [
      {
        question: "怎么用越南语询问对方的名字？",
        options: ["Bạn khỏe không?", "Bạn tên là gì?", "Bạn đi đâu đấy?", "Bạn ở đâu?"],
        answer: 1,
        explanation: "“Bạn tên là gì?” 即“你叫什么名字？”。"
      },
      {
        question: "“Tôi là người Trung Quốc” 的中文意思是：",
        options: ["我是越南人", "我是中国人", "我是美国人", "我是学生"],
        answer: 1,
        explanation: "Người (人) + Trung Quốc (中国) = 中国人。"
      }
    ]
  },

  {
    id: 3,
    lessonNumber: "03",
    titleZh: "数字与计数",
    titleVi: "Số đếm & Đếm tiền",
    icon: "🔢",
    duration: "7 分钟",
    level: "实用数字",
    summaryZh: "掌握1到10的基础数字与越南盾金额读法。",
    vocabularies: [
      {
        vi: "Một, Hai, Ba",
        zh: "一、二、三",
        noteZh: "1 (một), 2 (hai), 3 (ba)",
        exampleVi: "Một, hai, ba, bắt đầu!",
        exampleZh: "一、二、三，开始！"
      },
      {
        vi: "Bốn, Năm, Sáu",
        zh: "四、五、六",
        noteZh: "4 (bốn), 5 (năm), 6 (sáu)",
        exampleVi: "Bốn, năm, sáu.",
        exampleZh: "四、五、六。"
      },
      {
        vi: "Bảy, Tám, Chín, Mười",
        zh: "七、八、九、十",
        noteZh: "7 (bảy), 8 (tám), 9 (chín), 10 (mười)",
        exampleVi: "Đếm từ một đến mười.",
        exampleZh: "从一数到十。"
      },
      {
        vi: "Nghìn / Ngàn",
        zh: "千 (越南盾计算单位)",
        noteZh: "北方常用 nghìn, 南方常用 ngàn",
        exampleVi: "Mười nghìn đồng.",
        exampleZh: "一万越盾 (10个千)。"
      },
      {
        vi: "Triệu",
        zh: "百万",
        noteZh: "Một triệu = 1,000,000 越盾",
        exampleVi: "Một triệu đồng.",
        exampleZh: "一百万越盾。"
      }
    ],
    sentences: [
      {
        vi: "Một ly trà đá bao nhiêu tiền?",
        zh: "一杯冰茶多少钱？",
        breakdown: "Một (一) + ly (杯) + trà đá (冰茶) + bao nhiêu tiền (多少钱)"
      },
      {
        vi: "Năm mươi nghìn đồng.",
        zh: "五万越盾 (50k).",
        breakdown: "Năm mươi (五十) + nghìn (千) + đồng (越南盾)"
      }
    ],
    quizzes: [
      {
        question: "数字“3”在越南语中怎么读？",
        options: ["Một", "Hai", "Ba", "Bốn"],
        answer: 2,
        explanation: "1 là Một, 2 là Hai, 3 là Ba, 4 là Bốn."
      },
      {
        question: "越南买东西常说的“20k”越盾(Hai mươi nghìn)，“nghìn”代表什么单位？",
        options: ["百", "千", "万", "百万"],
        answer: 1,
        explanation: "“Nghìn” 是“千”的意思，20 nghìn 相当于两万越南盾。"
      }
    ]
  },

  {
    id: 4,
    lessonNumber: "04",
    titleZh: "时间与日期",
    titleVi: "Thời gian & Ngày tháng",
    icon: "⏰",
    duration: "6 分钟",
    level: "日常表达",
    summaryZh: "学会看时间、问点数以及今天/明天/昨天的说法。",
    vocabularies: [
      {
        vi: "Hôm nay",
        zh: "今天",
        noteZh: "今天、现今",
        exampleVi: "Hôm nay tôi được nghỉ.",
        exampleZh: "今天我放假休息。"
      },
      {
        vi: "Ngày mai",
        zh: "明天",
        noteZh: "明天",
        exampleVi: "Ngày mai gặp lại nhé.",
        exampleZh: "明天再见哦。"
      },
      {
        vi: "Hôm qua",
        zh: "昨天",
        noteZh: "过去的那一天",
        exampleVi: "Hôm qua tôi đi mua sắm.",
        exampleZh: "昨天我去逛街购物了。"
      },
      {
        vi: "Bây giờ",
        zh: "现在",
        noteZh: "此时此刻",
        exampleVi: "Bây giờ đi đâu?",
        exampleZh: "现在去哪里？"
      },
      {
        vi: "Mấy giờ",
        zh: "几点",
        noteZh: "提问时间",
        exampleVi: "Bây giờ là mấy giờ rồi?",
        exampleZh: "现在几点了？"
      }
    ],
    sentences: [
      {
        vi: "Bây giờ là 7 giờ tối.",
        zh: "现在是晚上7点。",
        breakdown: "Bây giờ (现在) + là (是) + 7 giờ (7点) + tối (晚上)"
      },
      {
        vi: "Hôm nay là ngày mấy?",
        zh: "今天是几号？",
        breakdown: "Hôm nay (今天) + là (是) + ngày mấy (几号)"
      }
    ],
    quizzes: [
      {
        question: "“明天”用越南语怎么表达？",
        options: ["Hôm nay", "Ngày mai", "Hôm qua", "Bây giờ"],
        answer: 1,
        explanation: "“Ngày mai” 是明天，“Hôm nay” 是今天，“Hôm qua” 是昨天。"
      },
      {
        question: "当你想问“现在几点了？”，可以说：",
        options: ["Bao nhiêu tiền?", "Bây giờ là mấy giờ?", "Bạn đi đâu đấy?", "Có ngon không?"],
        answer: 1,
        explanation: "“Bây giờ là mấy giờ?” 意思就是“现在是几点？”。"
      }
    ]
  },

  {
    id: 5,
    lessonNumber: "05",
    titleZh: "越南美食与点餐",
    titleVi: "Món ăn & Gọi món",
    icon: "🍜",
    duration: "8 分钟",
    level: "生活美食",
    summaryZh: "在餐厅点越南粉、法棍面包，以及掌握不加香菜、不要辣等实用表达。",
    vocabularies: [
      {
        vi: "Phở",
        zh: "越南河粉",
        noteZh: "越南国宝级美食，常有牛肉粉 (phở bò) 和鸡肉粉 (phở gà)",
        exampleVi: "Cho tôi một tô phở bò chín.",
        exampleZh: "请给我一碗全熟牛肉粉。"
      },
      {
        vi: "Bánh mì",
        zh: "越南法棍面包",
        noteZh: "街头最流行的美食",
        exampleVi: "Bánh mì này rất giòn.",
        exampleZh: "这个面包很酥脆。"
      },
      {
        vi: "Không cay",
        zh: "不要辣",
        noteZh: "怕吃辣必学短语",
        exampleVi: "Cho tôi không cay nhé!",
        exampleZh: "请帮我做不辣的！"
      },
      {
        vi: "Đừng cho hành",
        zh: "不要放葱",
        noteZh: "Đừng (不要) + cho (放) + hành (葱)",
        exampleVi: "Phở đừng cho hành lá.",
        exampleZh: "河粉不要放葱花。"
      },
      {
        vi: "Ngon quá",
        zh: "太好吃了",
        noteZh: "赞美食物的万能句",
        exampleVi: "Món này ngon quá!",
        exampleZh: "这道菜太好吃了！"
      }
    ],
    sentences: [
      {
        vi: "Em ơi, cho anh gọi món!",
        zh: "服务员，我要点菜！",
        breakdown: "Em ơi (对年轻服务员的亲切呼唤) + cho anh gọi món (让我点菜)"
      },
      {
        vi: "Em ơi, tính tiền giúp anh!",
        zh: "服务员，帮我结账！",
        breakdown: "Em ơi (服务员) + tính tiền (结账) + giúp anh (帮我)"
      }
    ],
    quizzes: [
      {
        question: "如果你不能吃辣，点餐时该对服务员说什么？",
        options: ["Ngon quá", "Không cay", "Nhiều ớt", "Tính tiền"],
        answer: 1,
        explanation: "“Không cay” 意思是“不辣 / 不要辣”。"
      },
      {
        question: "在越南餐厅呼唤年轻服务员并结账，最自然的用语是：",
        options: ["Xin chào", "Em ơi, tính tiền!", "Tạm biệt", "Bao nhiêu tuổi?"],
        answer: 1,
        explanation: "“Em ơi, tính tiền!” 是非常地道和有礼貌的呼叫结账方式。"
      }
    ]
  },

  {
    id: 6,
    lessonNumber: "06",
    titleZh: "在咖啡店",
    titleVi: "Ở quán cà phê",
    icon: "☕",
    duration: "7 分钟",
    level: "越式生活",
    summaryZh: "深入越南独特的咖啡文化，掌握滴漏咖啡、冰奶咖与打包技巧。",
    vocabularies: [
      {
        vi: "Cà phê sữa đá",
        zh: "越南冰奶咖啡",
        noteZh: "浓郁黑咖啡加上炼乳和碎冰，越南最具代表性饮品",
        exampleVi: "Một ly cà phê sữa đá nhiều đá.",
        exampleZh: "一杯冰奶咖啡，多放点冰。"
      },
      {
        vi: "Bạc xỉu",
        zh: "白咖啡 (多奶少咖啡)",
        noteZh: "适合不太能喝苦味咖啡的朋友",
        exampleVi: "Tôi uống một ly bạc xỉu nóng.",
        exampleZh: "我喝一杯热的白咖啡。"
      },
      {
        vi: "Ít ngọt / Ít đường",
        zh: "少糖 / 微甜",
        noteZh: "越南饮品普遍偏甜，建议初学者点 ít ngọt",
        exampleVi: "Cho em ít ngọt thôi nhé.",
        exampleZh: "请帮我少放点糖。"
      },
      {
        vi: "Mang đi",
        zh: "外带 / 打包",
        noteZh: "外带打包用语",
        exampleVi: "Uống tại đây hay mang đi?",
        exampleZh: "在这喝还是打包？"
      },
      {
        vi: "Trà đá",
        zh: "冰茶",
        noteZh: "越南咖啡馆通常会免费送一杯清凉冰茶",
        exampleVi: "Cho thêm một ly trà đá.",
        exampleZh: "再给一杯冰茶。"
      }
    ],
    sentences: [
      {
        vi: "Cho tôi một ly cà phê sữa đá mang đi.",
        zh: "请给我一杯冰奶咖啡，打包带走。",
        breakdown: "Cho tôi (给我) + một ly (一杯) + cà phê sữa đá (冰奶咖啡) + mang đi (打包)"
      },
      {
        vi: "Quán có mật khẩu Wi-Fi không ạ?",
        zh: "请问店里有Wi-Fi密码吗？",
        breakdown: "Quán (店) + có (有) + mật khẩu Wi-Fi (WiFi密码) + không ạ (吗)"
      }
    ],
    quizzes: [
      {
        question: "“Cà phê sữa đá” 指的是哪种饮品？",
        options: ["冰红茶", "越南冰奶咖啡", "纯黑咖啡", "热牛奶"],
        answer: 1,
        explanation: "“Cà phê” (咖啡) + “sữa” (牛奶/炼乳) + “đá” (冰块)。"
      },
      {
        question: "如果你不想在店里喝，想打包带走，应该说：",
        options: ["Uống tại đây", "Mang đi", "Không có đá", "Ít đường"],
        answer: 1,
        explanation: "“Mang đi” 意思是打包外带。"
      }
    ]
  },

  {
    id: 7,
    lessonNumber: "07",
    titleZh: "购物与讨价还价",
    titleVi: "Mua sắm & Trả giá",
    icon: "🛍️",
    duration: "7 分钟",
    level: "实用砍价",
    summaryZh: "在市场与商店问价、试穿以及礼貌商量优惠。",
    vocabularies: [
      {
        vi: "Bao nhiêu tiền?",
        zh: "多少钱？",
        noteZh: "最核心的购物问句",
        exampleVi: "Cái áo này bao nhiêu tiền?",
        exampleZh: "这件衣服多少钱？"
      },
      {
        vi: "Đắt quá",
        zh: "太贵了",
        noteZh: "砍价起手式",
        exampleVi: "Đắt quá chị ơi!",
        exampleZh: "大姐太贵了啦！"
      },
      {
        vi: "Giảm giá / Bớt đi",
        zh: "打折 / 便宜点",
        noteZh: "Bớt một chút được không? (便宜一点好吗？)",
        exampleVi: "Bớt cho em một chút đi.",
        exampleZh: "给我便宜一点吧。"
      },
      {
        vi: "Thử",
        zh: "试穿 / 尝试",
        noteZh: "Tôi thử được không? (我可以试一下吗？)",
        exampleVi: "Tôi có thể thử cái này không?",
        exampleZh: "我可以试一下这个吗？"
      },
      {
        vi: "Mua",
        zh: "买",
        noteZh: "Tôi mua cái này. (我买这个)",
        exampleVi: "Tôi lấy cái này nhé.",
        exampleZh: "我拿这个了。"
      }
    ],
    sentences: [
      {
        vi: "Đắt quá, bớt một chút được không?",
        zh: "太贵了，便宜一点可以吗？",
        breakdown: "Đắt quá (太贵了) + bớt một chút (少一点/便宜点) + được không (可以吗)"
      },
      {
        vi: "Tôi có thể thanh toán bằng thẻ hoặc quét mã không?",
        zh: "我可以刷卡或者扫码支付吗？",
        breakdown: "Thanh toán (付款) + thẻ (卡) + quét mã (扫码)"
      }
    ],
    quizzes: [
      {
        question: "在越南夜市看到心仪的纪念品，问价格应该说：",
        options: ["Bao nhiêu tiền?", "Đi đâu đấy?", "Xin lỗi nhé", "Không sao"],
        answer: 0,
        explanation: "“Bao nhiêu tiền?” 就是询问“多少钱？”。"
      },
      {
        question: "“Đắt quá, bớt đi!” 中的“Đắt quá”是什么意思？",
        options: ["很好吃", "太便宜了", "太贵了", "不好看"],
        answer: 2,
        explanation: "“Đắt” 是贵，“Đắt quá” 表示“太贵了”。"
      }
    ]
  },

  {
    id: 8,
    lessonNumber: "08",
    titleZh: "交通与出行",
    titleVi: "Giao thông & Đi lại",
    icon: "🛵",
    duration: "7 分钟",
    level: "街头出行",
    summaryZh: "掌握打车、搭乘 Grab 摩托、看导航指路的核心指示词汇。",
    vocabularies: [
      {
        vi: "Rẽ trái",
        zh: "左转",
        noteZh: "Trái 是左边",
        exampleVi: "Đến ngã ba thì rẽ trái.",
        exampleZh: "到了三岔路口就左转。"
      },
      {
        vi: "Rẽ phải",
        zh: "右转",
        noteZh: "Phải 是右边",
        exampleVi: "Đi qua đèn đỏ rồi rẽ phải.",
        exampleZh: "过了红绿灯然后右转。"
      },
      {
        vi: "Đi thẳng",
        zh: "直走",
        noteZh: "沿着当前方向一直走",
        exampleVi: "Cứ đi thẳng là đến nơi.",
        exampleZh: "一直直走就到了。"
      },
      {
        vi: "Dừng lại / Dừng ở đây",
        zh: "停下 / 在这里停",
        noteZh: "告诉司机停车位置",
        exampleVi: "Bác tài ơi, dừng ở đây giúp cháu!",
        exampleZh: "师傅，请帮我停在这里！"
      },
      {
        vi: "Đến nơi rồi",
        zh: "到了",
        noteZh: "到达目的地",
        exampleVi: "Chúng ta đến nơi rồi.",
        exampleZh: "我们已经到了。"
      }
    ],
    sentences: [
      {
        vi: "Bác tài ơi, cho cháu xuống ở đây!",
        zh: "师傅，请让我在这一站下车！",
        breakdown: "Bác tài (司机师傅) + cho cháu xuống (让我下车) + ở đây (在这里)"
      },
      {
        vi: "Đi từ đây đến sân bay mất bao lâu?",
        zh: "从这里去机场要多久？",
        breakdown: "Đi từ đây (从这走) + đến sân bay (到机场) + mất bao lâu (花多长时间)"
      }
    ],
    quizzes: [
      {
        question: "坐在 Grab 摩托车后面想提醒司机“向左拐”，应该说：",
        options: ["Đi thẳng", "Rẽ phải", "Rẽ trái", "Dừng lại"],
        answer: 2,
        explanation: "“Rẽ trái” 是左转，“Rẽ phải” 是右转。"
      },
      {
        question: "想告诉出租车司机“停在这里”，应该说：",
        options: ["Đi nhanh lên", "Dừng ở đây", "Rẽ trái", "Xin chào"],
        answer: 1,
        explanation: "“Dừng ở đây” 意思是“停在这里”。"
      }
    ]
  },

  {
    id: 9,
    lessonNumber: "09",
    titleZh: "职场与工作沟通",
    titleVi: "Công việc & Giao tiếp văn phòng",
    icon: "💼",
    duration: "8 分钟",
    level: "进阶交流",
    summaryZh: "掌握办公室日常沟通、传达文件、会议讨论与加班交流。",
    vocabularies: [
      {
        vi: "Họp / Cuộc họp",
        zh: "开会 / 会议",
        noteZh: "Họp nhóm (团队开会)",
        exampleVi: "Chiều nay 3 giờ chúng ta có cuộc họp.",
        exampleZh: "今天下午3点我们有个会议。"
      },
      {
        vi: "Gửi email",
        zh: "发邮件",
        noteZh: "工作最常见行为",
        exampleVi: "Tôi đã gửi email cho bạn rồi.",
        exampleZh: "我已经给你发了邮件了。"
      },
      {
        vi: "Tài liệu / Báo cáo",
        zh: "文件 / 报告",
        noteZh: "Báo cáo tiến độ (进度报告)",
        exampleVi: "Bạn xem qua tài liệu này giúp mình nhé.",
        exampleZh: "请帮我过目一下这份文件。"
      },
      {
        vi: "Hoàn thành",
        zh: "完成",
        noteZh: "Xong rồi / Hoàn thành rồi",
        exampleVi: "Dự án đã hoàn thành đúng hạn.",
        exampleZh: "项目已经按时完成了。"
      },
      {
        vi: "Hỗ trợ",
        zh: "支持 / 协助",
        noteZh: "求助同事时的礼貌用语",
        exampleVi: "Cảm ơn bạn đã hỗ trợ tôi.",
        exampleZh: "感谢你在工作上的支持与协助。"
      }
    ],
    sentences: [
      {
        vi: "Tôi có thể giúp gì cho bạn không?",
        zh: "我有什么能帮到你的吗？",
        breakdown: "Tôi có thể (我能否) + giúp gì (帮什么) + cho bạn (给你)"
      },
      {
        vi: "Hôm nay công việc rất thuận lợi.",
        zh: "今天的工作非常顺利。",
        breakdown: "Hôm nay (今天) + công việc (工作) + rất thuận lợi (非常顺利)"
      }
    ],
    quizzes: [
      {
        question: "同事帮你把文件审查完了，你想说“感谢你的支持协助”，可以用：",
        options: ["Cảm ơn bạn đã hỗ trợ!", "Xin lỗi nhiều!", "Bao nhiêu tiền?", "Đi thẳng nhé!"],
        answer: 0,
        explanation: "“Hỗ trợ” 意为支持、协助，是职场中非常有素养的致谢词。"
      },
      {
        question: "“Cuộc họp” 对应的中文含义是：",
        options: ["午餐", "会议", "休假", "工资"],
        answer: 1,
        explanation: "“Cuộc họp” 就是“会议”的意思。"
      }
    ]
  },

  {
    id: 10,
    lessonNumber: "10",
    titleZh: "地道日常聊天",
    titleVi: "Hội thoại hàng ngày",
    icon: "💬",
    duration: "8 分钟",
    level: "生活自如",
    summaryZh: "学会相约朋友逛街喝茶、询问近况及表达喜怒哀乐。",
    vocabularies: [
      {
        vi: "Đi chơi",
        zh: "出去玩",
        noteZh: "越南年轻人最爱的词汇",
        exampleVi: "Cuối tuần này đi chơi không bạn?",
        exampleZh: "这周末出去玩不？"
      },
      {
        vi: "Đi cà phê",
        zh: "去喝咖啡 (坐咖啡厅聊天)",
        noteZh: "在越南不仅仅是喝咖啡，代表朋友聚会聊天社交",
        exampleVi: "Rảnh không, đi cà phê tám chuyện đi!",
        exampleZh: "有空吗，去喝咖啡闲聊八卦吧！"
      },
      {
        vi: "Thật không?",
        zh: "真的吗？",
        noteZh: "表达惊讶或求证",
        exampleVi: "Thật không? Tin tốt quá!",
        exampleZh: "真的吗？太好了！"
      },
      {
        vi: "Đồng ý",
        zh: "赞成 / 同意 / 好啊",
        noteZh: "爽快答应朋友的邀约",
        exampleVi: "Tôi hoàn toàn đồng ý.",
        exampleZh: "我完全赞成。"
      },
      {
        vi: "Chúc bạn một ngày tốt lành",
        zh: "祝你有美好的一天",
        noteZh: "温馨温暖的告别祝福",
        exampleVi: "Tạm biệt, chúc bạn một ngày tốt lành!",
        exampleZh: "再见，祝你有美好的一天！"
      }
    ],
    sentences: [
      {
        vi: "Tối nay bạn có rảnh không, mình đi ăn tối nhé?",
        zh: "今晚你有空吗，我们一起去吃晚饭吧？",
        breakdown: "Tối nay (今晚) + có rảnh không (有空吗) + mình đi ăn (我们去吃)"
      },
      {
        vi: "Ý kiến hay đấy, hẹn gặp bạn lúc 7 giờ tối!",
        zh: "好主意，那今晚7点见！",
        breakdown: "Ý kiến hay (好主意) + hẹn gặp bạn (跟你约定见面) + lúc 7 giờ (7点)"
      }
    ],
    quizzes: [
      {
        question: "越南朋友对你说“Đi cà phê không?”，真正的意思是：",
        options: ["你要去买咖啡豆吗？", "有空一起去咖啡馆坐坐聊天吗？", "咖啡多少钱？", "不要喝咖啡"],
        answer: 1,
        explanation: "在越南，“Đi cà phê” 是一种社交文化，指约着一起去咖啡馆坐下来喝饮料、聊天放松。"
      },
      {
        question: "听到令人惊喜的好消息时，用哪句话表达“真的吗？”：",
        options: ["Xin lỗi", "Thật không?", "Không cay", "Tạm biệt"],
        answer: 1,
        explanation: "“Thật không?” 意思是“真的吗？”。"
      }
    ]
  }
];
