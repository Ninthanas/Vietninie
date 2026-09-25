// 越南语互动测验题库 (Dữ liệu bài tập trắc nghiệm tiếng Việt)
// 包含单选题、听辨题、情境应答题，配有中文深度解析

const QUIZ_BANK = [
  {
    id: "q_01",
    questionZh: "在越南语中，“谢谢”的最常用说法是：",
    audioPrompt: "Cảm ơn",
    options: ["Xin chào", "Cảm ơn", "Tạm biệt", "Xin lỗi"],
    correctIndex: 1,
    explanationZh: "“Cảm ơn” 是越南语中最标准的致谢语，词源为古汉语“感恩”，在闽南语或粤语中发音非常接近。"
  },
  {
    id: "q_02",
    questionZh: "初次与越南朋友见面打招呼，最常用的问候语是：",
    audioPrompt: "Xin chào",
    options: ["Xin lỗi", "Xin chào", "Chúc ngủ ngon", "Bao nhiêu tiền"],
    correctIndex: 1,
    explanationZh: "“Xin chào” 相当于中文的“你好/您好”，广泛适用于任何场合、任何年龄段的初次礼貌问候。"
  },
  {
    id: "q_03",
    questionZh: "在市场逛街看到心仪的商品，询问“多少钱？”应该说：",
    audioPrompt: "Bao nhiêu tiền",
    options: ["Bao nhiêu tiền?", "Bạn tên là gì?", "Ở đâu vậy?", "Đi thẳng nhé?"],
    correctIndex: 0,
    explanationZh: "“Bao nhiêu” 是“多少”，“tiền” 是“钱”（汉字词：钱）。连起来即“多少钱？”。"
  },
  {
    id: "q_04",
    questionZh: "在餐厅结账，听到服务员说“Hai mươi nghìn đồng”，请问这道菜是多少越南盾？",
    audioPrompt: "Hai mươi nghìn",
    options: ["2,000 盾", "20,000 盾 (20k)", "200,000 盾", "200 盾"],
    correctIndex: 1,
    explanationZh: "“Hai” 是 2，“mươi” 表示十，“Hai mươi” 是 20，“nghìn” 是千。所以 20 nghìn = 20,000 越盾。"
  },
  {
    id: "q_05",
    questionZh: "想在街头点一杯最具代表性的“越南冰奶咖啡”，应该点什么？",
    audioPrompt: "Cà phê sữa đá",
    options: ["Trà đá", "Cà phê đen nóng", "Cà phê sữa đá", "Bạc xỉu nóng"],
    correctIndex: 2,
    explanationZh: "“Cà phê sữa đá” 即咖啡 (cà phê) + 奶 (sữa) + 冰块 (đá)，是风靡全球的越式冰炼乳咖啡。"
  },
  {
    id: "q_06",
    questionZh: "如果不习惯吃太甜，点饮料时可以嘱咐店员：",
    audioPrompt: "Ít đường",
    options: ["Nhiều đường", "Ít đường", "Không có đá", "Cho thêm sữa"],
    correctIndex: 1,
    explanationZh: "“Ít đường” 意为“少糖”（ít: 少，đường: 糖），或者可以说“ít ngọt”（少甜）。"
  },
  {
    id: "q_07",
    questionZh: "当不小心碰到别人，需要礼貌道歉时，应该说：",
    audioPrompt: "Xin lỗi",
    options: ["Cảm ơn", "Không sao", "Xin lỗi", "Tạm biệt"],
    correctIndex: 2,
    explanationZh: "“Xin lỗi” 是最常用的道歉语，相当于中文的“对不起”或“抱歉”。"
  },
  {
    id: "q_08",
    questionZh: "当别人对你说了“Cảm ơn bạn”（谢谢你），你应该礼貌回复：",
    audioPrompt: "Không có gì",
    options: ["Không có gì", "Đắt quá", "Hẹn gặp lại", "Đi chơi không"],
    correctIndex: 0,
    explanationZh: "“Không có gì” 字面意思是“没有什么”，相当于中文的“不客气 / 没事”。"
  },
  {
    id: "q_09",
    questionZh: "在餐厅就餐不能吃辣，应该明确要求：",
    audioPrompt: "Không cay",
    options: ["Nhiều ớt", "Cay lắm", "Không cay", "Ngon tuyệt"],
    correctIndex: 2,
    explanationZh: "“Không cay” 意为“不辣 / 不要辣”（không: 不，cay: 辣）。"
  },
  {
    id: "q_10",
    questionZh: "坐摩托车到目的地后，告诉司机“停在这里”，应该说：",
    audioPrompt: "Dừng ở đây",
    options: ["Rẽ trái", "Đi thẳng tiếp", "Dừng ở đây", "Đi nhanh lên"],
    correctIndex: 2,
    explanationZh: "“Dừng ở đây” 意为“停在这里”（dừng: 停止，ở đây: 在这里）。"
  },
  {
    id: "q_11",
    questionZh: "“Hôm nay” 在中文里是什么意思？",
    audioPrompt: "Hôm nay",
    options: ["昨天", "今天", "明天", "现在"],
    correctIndex: 1,
    explanationZh: "“Hôm nay” 是“今天”，“Hôm qua” 是昨天，“Ngày mai” 是明天。"
  },
  {
    id: "q_12",
    questionZh: "越南朋友发信息问你：“Đi cà phê không?”，最恰当的理解是：",
    audioPrompt: "Đi cà phê không?",
    options: ["去买咖啡豆吗？", "有空一起去咖啡馆坐坐聊天吗？", "你会煮咖啡吗？", "咖啡坏了吗？"],
    correctIndex: 1,
    explanationZh: "在越南文化中，“Đi cà phê” 已经演变成为朋友之间聚会聊天、社交放松的代名词。"
  },
  {
    id: "q_13",
    questionZh: "在商场购物，觉得标价偏高想尝试砍价，第一句可以说：",
    audioPrompt: "Đắt quá",
    options: ["Rẻ quá", "Đắt quá", "Ngon quá", "Đẹp quá"],
    correctIndex: 1,
    explanationZh: "“Đắt quá” 意为“太贵了”，接着可以说“Bớt một chút được không?”（能便宜一点吗？）。"
  },
  {
    id: "q_14",
    questionZh: "数字“Một, Hai, Ba, Bốn”分别代表：",
    audioPrompt: "Một Hai Ba Bốn",
    options: ["1, 2, 3, 4", "2, 4, 6, 8", "10, 20, 30, 40", "1, 3, 5, 7"],
    correctIndex: 0,
    explanationZh: "Một = 1, Hai = 2, Ba = 3, Bốn = 4。"
  },
  {
    id: "q_15",
    questionZh: "在咖啡店点单完毕，店员询问“Uống ở đây hay mang đi?”，如果你想打包带走，应该回答：",
    audioPrompt: "Mang đi",
    options: ["Uống ở đây", "Mang đi", "Không đường", "Có đá"],
    correctIndex: 1,
    explanationZh: "“Mang đi” 是“带走 / 打包”，而“Uống ở đây” 是在店里喝（堂食）。"
  },
  {
    id: "q_16",
    questionZh: "询问对方“洗手间在哪里？”，越南语是：",
    audioPrompt: "Nhà vệ sinh ở đâu?",
    options: ["Chợ ở đâu?", "Nhà vệ sinh ở đâu?", "Sân bay ở đâu?", "Khách sạn ở đâu?"],
    correctIndex: 1,
    explanationZh: "“Nhà vệ sinh” 是卫生间/洗手间，“ở đâu” 是在哪里。"
  },
  {
    id: "q_17",
    questionZh: "自我介绍时，如果想说“我是中国人”，应该说：",
    audioPrompt: "Tôi là người Trung Quốc",
    options: ["Tôi là người Việt Nam", "Tôi là người Trung Quốc", "Tôi là người Hàn Quốc", "Tôi là người Mỹ"],
    correctIndex: 1,
    explanationZh: "Tôi (我) + là (是) + người Trung Quốc (中国人)。"
  },
  {
    id: "q_18",
    questionZh: "在街上被热心指路说“Cứ đi thẳng rồi rẽ phải”，请问具体的路线是：",
    audioPrompt: "Đi thẳng rồi rẽ phải",
    options: ["一直直走然后左转", "一直直走然后右转", "往回走然后直走", "原地掉头"],
    correctIndex: 1,
    explanationZh: "“Đi thẳng” 是直走，“rẽ phải” 是右转（phải: 右，trái: 左）。"
  },
  {
    id: "q_19",
    questionZh: "越南语声调中，标注为“ma”且不带任何声调符号的声调被称为：",
    audioPrompt: "ma",
    options: ["Thanh Sắc (锐声)", "Thanh Ngang (平声)", "Thanh Nặng (重声)", "Thanh Huyền (玄声)"],
    correctIndex: 1,
    explanationZh: "不带调号的为 Thanh Ngang（平声），相当于五度标记法的 55 高平调。"
  },
  {
    id: "q_20",
    questionZh: "结束愉快的对话并道别，最温暖的祝福语是：",
    audioPrompt: "Chúc bạn một ngày tốt lành",
    options: ["Bao nhiêu tiền", "Chúc bạn một ngày tốt lành!", "Tôi không biết", "Ngon quá"],
    correctIndex: 1,
    explanationZh: "“Chúc bạn một ngày tốt lành!” 意为“祝你度过美好的一天！”。"
  }
];
