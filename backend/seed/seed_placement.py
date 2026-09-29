import sys
import os
import asyncio
import json

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from database import get_db

questions = [
    # A1
    ("pq_a1_1", "'Xin chào' 是什么意思？", json.dumps(["再见","你好","谢谢","对不起"], ensure_ascii=False), 1, "Xin chào 是越南语最通用的问候语，相当于中文的'你好'。", "A1", 0),
    ("pq_a1_2", "越南语数字 'ba' 是哪个数字？", json.dumps(["1","2","3","4"], ensure_ascii=False), 2, "越南语数字: một(1), hai(2), ba(3), bốn(4)。", "A1", 1),
    ("pq_a1_3", "'Cảm ơn' 用于什么场合？", json.dumps(["打招呼","道谢","道歉","告别"], ensure_ascii=False), 1, "Cảm ơn 意为谢谢，词源为古汉语'感恩'。", "A1", 2),
    ("pq_a1_4", "'Tôi' 在越南语中的意思是？", json.dumps(["你","他","我","我们"], ensure_ascii=False), 2, "Tôi 是越南语最通用的第一人称代词'我'。", "A1", 3),
    ("pq_a1_5", "越南语中'水'怎么说？", json.dumps(["Nước","Cơm","Rau","Thịt"], ensure_ascii=False), 0, "Nước 是水，Cơm 是米饭，Rau 是蔬菜，Thịt 是肉。", "A1", 4),
    # A2
    ("pq_a2_1", "'Bao nhiêu tiền?' 是什么意思？", json.dumps(["在哪里","多少钱","什么时候","怎么去"], ensure_ascii=False), 1, "Bao nhiêu(多少) + tiền(钱) = 多少钱？", "A2", 5),
    ("pq_a2_2", "'ít đường' 的意思是？", json.dumps(["多糖","无糖","少糖","正常甜"], ensure_ascii=False), 2, "ít 表示少，đường 表示糖，合起来是少糖。", "A2", 6),
    ("pq_a2_3", "'Cho tôi...' 是什么句型？", json.dumps(["我去...","给我...","我有...","我是..."], ensure_ascii=False), 1, "Cho tôi 意思是'给我...'，在餐厅点单常用。", "A2", 7),
    ("pq_a2_4", "问路时哪个词表示'左转'？", json.dumps(["Rẽ phải","Đi thẳng","Rẽ trái","Quay lại"], ensure_ascii=False), 2, "Rẽ trái=左转，Rẽ phải=右转，Đi thẳng=直走，Quay lại=返回。", "A2", 8),
    ("pq_a2_5", "'Cà phê sữa đá' 是什么饮料？", json.dumps(["热茶","橙汁","越南冰奶咖啡","椰汁"], ensure_ascii=False), 2, "Cà phê(咖啡)+sữa(奶)+đá(冰块)=越南冰奶咖啡。", "A2", 9),
    # B1
    ("pq_b1_1", "'Tôi bị cảm' 是什么意思？", json.dumps(["我很累","我感冒了","我头疼","我发烧了"], ensure_ascii=False), 1, "bị 表示遭受，cảm 是感冒，合起来是我感冒了。", "B1", 10),
    ("pq_b1_2", "'Phòng đơn' 在酒店中是指？", json.dumps(["双人间","套间","单人间","家庭房"], ensure_ascii=False), 2, "đơn 源于汉字'单'，Phòng đơn 即单人间。", "B1", 11),
    ("pq_b1_3", "越南语中'堵车'怎么说？", json.dumps(["Tai nạn","Kẹt xe","Đường cao tốc","Vé xe"], ensure_ascii=False), 1, "Kẹt xe 是堵车，Tai nạn 是事故，Đường cao tốc 是高速公路。", "B1", 12),
    ("pq_b1_4", "'Tôi muốn đặt bàn cho 4 người' 是什么意思？", json.dumps(["订4张票","预订4人桌","要4份菜单","付4人账单"], ensure_ascii=False), 1, "đặt bàn=订桌，cho 4 người=给4个人。", "B1", 13),
    ("pq_b1_5", "'Bác sĩ' 是什么职业？", json.dumps(["律师","工程师","医生","老师"], ensure_ascii=False), 2, "Bác sĩ 源于汉字'博士'，越南语指医生。", "B1", 14),
    # B2
    ("pq_b2_1", "商务越南语中 'hợp đồng' 是指？", json.dumps(["发票","合同","报价单","收据"], ensure_ascii=False), 1, "hợp đồng 源于汉字'合同'，即合同/合约。", "B2", 15),
    ("pq_b2_2", "'Chúng tôi xin đề nghị giảm giá 10%' 的意思是？", json.dumps(["我们接受10%折扣","我们建议降价10%","产品降价了10%","我们要求加价10%"], ensure_ascii=False), 1, "đề nghị=建议/提议，giảm giá=降价，10%=十个百分点。", "B2", 16),
    ("pq_b2_3", "越南语中'谈判'是？", json.dumps(["Ký kết","Đàm phán","Thanh toán","Xuất khẩu"], ensure_ascii=False), 1, "Đàm phán 源于汉字'谈判'，其他词：ký kết=签约，thanh toán=付款。", "B2", 17),
    ("pq_b2_4", "'Lợi nhuận' 在财务语境中指？", json.dumps(["成本","税率","利润","营业额"], ensure_ascii=False), 2, "Lợi nhuận 源于汉字'利润'，即盈利/净利润。", "B2", 18),
    ("pq_b2_5", "正式商务邮件的越南语开头应该用？", json.dumps(["Hey bạn!","Kính gửi...","Alo!","Này..."], ensure_ascii=False), 1, "Kính gửi 意为'敬致'，是越南正式信函的标准开头语。", "B2", 19),
    # C1
    ("pq_c1_1", "成语 'được voi đòi tiên' 比喻什么？", json.dumps(["知恩图报","贪得无厌","量力而行","知足常乐"], ensure_ascii=False), 1, "字面意思是'得了大象还要神仙'，比喻贪得无厌，相当于中文的'得陇望蜀'。", "C1", 20),
    ("pq_c1_2", "俚语 'chém gió' 是什么意思？", json.dumps(["切风","吹牛/夸大","快速移动","冷静下来"], ensure_ascii=False), 1, "chém gió 字面是'砍风'，俚语意为吹牛、夸大其词。", "C1", 21),
    ("pq_c1_3", "'Không có bột sao gột nên hồ' 对应哪个中文成语？", json.dumps(["水到渠成","巧妇难为无米之炊","有志者事竟成","机不可失"], ensure_ascii=False), 1, "字面意思是'没有淀粉怎能做糊'，即巧妇难为无米之炊。", "C1", 22),
    ("pq_c1_4", "'thấu hiểu' 在情感语境中是什么意思？", json.dumps(["误解","深刻理解","表面了解","完全不懂"], ensure_ascii=False), 1, "thấu 意为透彻，hiểu 意为理解，合起来是深刻理解/感同身受。", "C1", 23),
    ("pq_c1_5", "'trăn trở' 描述什么内心状态？", json.dumps(["轻松快乐","辗转纠结","完全平静","漠不关心"], ensure_ascii=False), 1, "trăn trở 描述内心不安、辗转反侧、纠结苦恼的状态。", "C1", 24),
    # C2
    ("pq_c2_1", "'人生观' 用越南语表达是？", json.dumps(["Thế giới quan","Nhân sinh quan","Triết học","Đạo đức học"], ensure_ascii=False), 1, "Nhân sinh quan 源于汉字'人生观'，Thế giới quan 是'世界观'。", "C2", 25),
    ("pq_c2_2", "文学词汇 'vô thường' 源于哪个哲学传统？", json.dumps(["儒家","道家","佛教","法家"], ensure_ascii=False), 2, "vô thường 源于梵语 anicca，是佛教核心概念，意为无常。", "C2", 26),
    ("pq_c2_3", "阮攸（Nguyễn Du）的代表作越南语原名是？", json.dumps(["Lục Vân Tiên","Truyện Kiều","Chinh phụ ngâm","Nam Quốc Sơn Hà"], ensure_ascii=False), 1, "Truyện Kiều（翠翘传）是越南文学史上最伟大的作品，由阮攸创作。", "C2", 27),
    ("pq_c2_4", "'物是人非' 最贴近的越南文学表达是？", json.dumps(["Vật đổi sao dời","Thăng trầm","Dâu bể","Bạc mệnh"], ensure_ascii=False), 0, "Vật đổi sao dời 字面意思是'物换星移'，最能表达物是人非的感慨。", "C2", 28),
    ("pq_c2_5", "'tài mệnh tương đố' 描述什么文学主题？", json.dumps(["才华与命运的抗争","爱情的甜蜜","友情的重要","自然的壮美"], ensure_ascii=False), 0, "tài mệnh tương đố 意为才与命相抗，是《翠翘传》的核心主题。", "C2", 29),
]

async def seed_placement():
    db = get_db()
    
    for row in questions:
        await db.execute(
            """
            INSERT OR REPLACE INTO placement_questions 
            (id, question_zh, options, correct_index, explanation_zh, level, sort_order) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            row
        )
        print(f"Seeded {row[0]}")
        
    await db.close()
    
if __name__ == "__main__":
    asyncio.run(seed_placement())
