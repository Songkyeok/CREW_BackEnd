module.exports = {
    // 사이드바
    notice_get: `SELECT nt.*, mm.MOIM_TITLE, mm.MOIM_IMG, us.USER_NICK, us.USER_IMG, bd.BOARD_CON 
    FROM tb_notice nt
    LEFT OUTER JOIN tb_moim mm ON nt.NOTICE_TARGET_MOIM = mm.moim_no
    LEFT OUTER JOIN tb_user us ON nt.NOTICE_TARGET_USER = us.user_no
    LEFT OUTER JOIN tb_board bd ON nt.NOTICE_TARGET_BOARD = bd.board_no
    WHERE nt.user_no=?
    ORDER BY NOTICE_SDD DESC LIMIT 20;`,         // 8-16
    notice_check: `UPDATE tb_notice SET NOTICE_EDD = NOW() 
    WHERE (notice_no = ?)`,             // 8-12

    search: `INSERT INTO tb_search (user_no, search_kw) VALUES (?, ?)`,
    search_mine_get: `SELECT * FROM tb_search WHERE user_no=? AND search_dlt=0 ORDER BY search_ssd DESC Limit 5`,
    search_delete: `UPDATE tb_search SET search_dlt=1 WHERE search_no = ? `,
    search_hot_get: `SELECT search_kw, count(*) FROM themoim.tb_search GROUP BY search_kw ORDER BY count(*) DESC LIMIT 5`,
    my_moim_list: `SELECT * FROM tb_moim mm JOIN tb_moim_join mj
    ON mm.moim_no = mj.moim_no
    WHERE mj.user_no = ?`,

    // 로그인 회원가입
    id_check: `SELECT * FROM tb_user WHERE user_id = ?`,
    login: `SELECT user_pw FROM tb_user WHERE user_id = ?`,
    join: `INSERT INTO tb_user (user_id, user_pw) VALUES(?,?)`,
    user_no_get: `SELECT user_no FROM tb_user WHERE user_id = ?`,
    profile_check: `SELECT user_tel FROM tb_user WHERE user_no = ?;`,

    naverlogin: `INSERT INTO tb_user (user_id, user_nick) VALUES (?,?)`,
    naver_id_check: `SELECT * FROM tb_user WHERE user_id = ?`,
    kakaoJoin: `INSERT INTO tb_user (user_id, user_nick, user_social_tp ) VALUES(?,?,1)`,
    kakao_check: `SELECT * FROM tb_user WHERE user_id = ?`,

    // 회원 탈퇴
    pw_check: `SELECT user_pw FROM tb_user WHERE user_no = ?`, //230813
    user_social_tp: `SELECT user_social_tp FROM tb_user WHERE user_no = ?;`,  //230816
    delete_user_bb: `DELETE FROM tb_user WHERE user_no = ?`,  //230813


    // ID 비밀번호 찾기
    id_find: `SELECT user_id FROM tb_user WHERE user_tel = ?`,
    user_check: `SELECT user_no FROM tb_user WHERE user_tel = ? AND user_id = ?`,
    pw_find: `SELECT user_pw FROM tb_user WHERE user_tel = ?`, 
    pw_check1: `SELECT user_pw FROM tb_user WHERE user_no = ?`, 
    pw_ck: 'SELECT * FROM tb_user WHERE user_no = ? AND user_pw = ?',
    pass_update: 'UPDATE tb_user SET user_pw = ? WHERE user_no = ?',


    // 검색
    search_list: `SELECT *
    FROM tb_moim 
    WHERE moim_title LIKE ?`,

    //faq
    faq: `SELECT * FROM TB_QNA;`,

    // 유저 정보
    user_img_get: `SELECT u.USER_NO, u.USER_IMG, u.USER_NICK
        FROM TB_MOIM m
        JOIN TB_USER u ON m.USER_NO = u.USER_NO
        WHERE m.MOIM_NO = ?`,
    get_user_info: `SELECT user_img, user_id, user_nick, user_tel, user_birth, user_gender, user_mbti
        FROM tb_user
        WHERE user_no = ?`,
    get_user_hobby: `SELECT  c.category_nm
        from tb_hobby h join tb_category c
        on h.category_no = c.category_no
        WHERE h.user_no = ?`,
    get_user_zone:`SELECT user_adr1, user_adr2 FROM tb_user WHERE user_no = ?`,
    user_hobby_no: `SELECT category_no FROM tb_hobby WHERE user_no = ?`,
    check_hobby: `SELECT * FROM tb_hobby where user_no = ?`,
    get_category: `SELECT * FROM themoim.tb_category;`,


    // 유저 정보 수정
    delete_hobby: `DELETE FROM tb_hobby WHERE user_no = ?`,
    hobby_update: `INSERT INTO tb_hobby (user_no, category_no) VALUES (?, ?)`,
    setting_update: `UPDATE tb_user
    SET user_nick = ?,  user_tel = ?,  user_gender = ?, user_img = ?, user_birth = ?
    WHERE user_no = ?`,
    zone_update:`UPDATE tb_user
    SET user_adr1 = ?, user_adr2 = ? 
    WHERE user_no = ?`,
    mbti: `UPDATE tb_user SET user_mbti = ? WHERE user_no = ?`,

    // 좋아요
    like_list: `SELECT * FROM tb_like WHERE user_no = ?`,
    like: `INSERT INTO tb_like (moim_no, user_no) VALUES (?, ?)`,
    like_check: `SELECT * FROM tb_like WHERE moim_no=? AND user_no=?`,
    dislike: `DELETE FROM tb_like WHERE moim_no=? AND user_no=?`,
    like_moim: `SELECT M.* FROM TB_MOIM AS M 
    INNER JOIN TB_LIKE AS L ON M.MOIM_NO = L.MOIM_NO 
    WHERE L.USER_NO = ?
    ORDER BY L.LIKE_SDD DESC;`,

    // 모임
    moim_join_first: `INSERT INTO tb_moim_join (moim_no, user_no) VALUES (?, ?)`,
    mbti_suggest   : `SELECT * FROM tb_moim WHERE category_no = ?`,

    moim_suggest   : `SELECT m.* FROM tb_moim m
                    LEFT JOIN (
                        SELECT moim_no, COUNT(*) AS click_count
                        FROM tb_click
                        GROUP BY moim_no
                    ) c ON m.moim_no = c.moim_no
                    WHERE m.cparent_no = (SELECT cparent_no FROM tb_moim WHERE moim_no = ?) AND m.moim_no != ?
                    ORDER BY c.click_count DESC LIMIT 3`,
    moim_create    : `INSERT INTO tb_moim 
                    (moim_title, moim_intro, moim_con, moim_adr, moim_max, user_no, category_no, cparent_no, category_nm)
                    VALUES (?, ?, ?, ?, ?, ?,?, ?, ?)`,
    get_moim_no    : `SELECT moim_no FROM tb_moim WHERE moim_title = ?`,
    moim_img_insert: `UPDATE tb_moim SET moim_img = ? WHERE moim_no = ?`,
    moim_q_insert  : `INSERT INTO tb_moim_question (MOIM_NO, MQ1, MQ2, MQ3) VALUES (?, ?, ?, ?)`,
    moim_list      : `SELECT * FROM tb_moim`,
    moim_detail    : `SELECT * FROM tb_moim WHERE moim_no = ?`,
    category       : `SELECT * FROM tb_category WHERE cparent_no = ?`,
    zone           : `SELECT * FROM tb_zone`,   
    moim_j_check   : `SELECT user_no FROM tb_moim_join WHERE moim_no = ? AND user_no = ?`, 
    moim_update    : `UPDATE tb_moim SET moim_title=?, moim_intro=?, moim_con=?, moim_adr=?, moim_max=?, category_no=?, cparent_no=?, category_nm=?    
                    WHERE moim_no = ?`,
    get_moim_img   : `SELECT moim_img FROM tb_moim WHERE moim_no = ?`, // 8-22
    moim_delete    : `DELETE FROM tb_moim WHERE moim_no = ?`, // 8-22



    moim_q_update  : `UPDATE tb_moim_question SET mq1 = ?, mq2 = ?, mq3 = ? WHERE moim_no = ?`,
    // moim 게시판
    post_write     : `INSERT INTO tb_board (board_con, moim_no, user_no, cal_no) VALUES (?, ?, ?, ?)`,
    board_img_insert:`INSERT INTO tb_board_img (board_img, board_no) VALUES (?, ?)`,
    post_list      : `SELECT bd.*, 
                            (SELECT count(*) FROM tb_board_cmt bc
                            WHERE bc.board_no = bd.board_no
                            GROUP BY bc.board_no) as CMT_CNT,
                            (SELECT count(*) FROM tb_board_like bl
                            WHERE bl.board_no = bd.board_no
                            GROUP BY bl.board_no) as LIKE_CNT
                        FROM tb_board bd
                        WHERE bd.moim_no = ? 
                        ORDER BY board_pin DESC, board_sdd DESC;`,
    post_img_list  : `SELECT * from tb_board_img WHERE board_no = ?`,
    post_write_user: `SELECT * from tb_board`,
    post_delete    : `DELETE FROM tb_board WHERE board_no = ?`,
    post_detail    : `SELECT * FROM tb_board WHERE board_no = ?`,
    post_update    : `UPDATE tb_board SET board_con = ?, cal_no = ? WHERE board_no = ?`,
    post_pin       : `UPDATE tb_board SET board_pin = 0 WHERE moim_no = ?`,
    post_pinup     : `UPDATE tb_board SET board_pin = 1 WHERE board_no = ?`,
    post_pin_get   : `SELECT * FROM tb_board WHERE board_pin = 1 AND moim_no = ?`, 
    post_like      : `INSERT INTO tb_board_like (board_no, user_no) VALUES (?, ?)`,
    post_like_check: `SELECT * FROM tb_board_like WHERE board_no = ? AND user_no = ?`,
    post_like_list : `SELECT * FROM tb_board_like WHERE user_no = ?`,
    post_dislike   : `DELETE FROM tb_board_like WHERE board_no = ? AND user_no = ?`,   
    post_cmt_write : `INSERT INTO tb_board_cmt (board_cmt_con, board_no, user_no) VALUES (?, ?, ?)`,
    post_cmt_list  : `SELECT * from tb_board_cmt WHERE board_no = ?`,
    post_cmt_delete: `DELETE FROM tb_board_cmt WHERE board_cmt_no = ?`,    
    // moim 일정
    calendar_create: `INSERT INTO tb_calendar (cal_nm, cal_sdd, cal_edd, moim_no) VALUES (?, ?, ?, ?)`,
    calendar_list  : `SELECT * FROM tb_calendar WHERE moim_no = ?`,
    calendar_join  : `INSERT INTO tb_calendar_detail VALUES (?, ?, ?)`,
    calendar_j_check:`SELECT * FROM tb_calendar_detail WHERE cal_no = ? AND user_no = ?`,
    calendar_j_info: `SELECT cd.cal_no, cd.moim_no, cd.user_no, u.user_nick, u.user_img
                    FROM tb_calendar_detail cd
                    JOIN tb_user u ON cd.user_no = u.user_no
                    WHERE cd.moim_no = ?`,
    // moim 챌린지
    chall_create   : `INSERT INTO tb_challenge (chall_title, chall_con, chall_sdd, chall_edd, chall_cnt, moim_no) VALUES (?, ?, ?, ?, ?, ?)`,
    chall_img_insert:`UPDATE tb_challenge SET chall_img = ? WHERE chall_no = ?`,
    chall_list     : `SELECT * FROM tb_challenge WHERE moim_no = ? ORDER BY CHALL_SDD DESC`,   
    chall_detail   : `SELECT * FROM tb_challenge WHERE chall_no = ?`,
    chall_d_create : `INSERT INTO tb_chall_detail (chall_d_con, chall_no, user_no) VALUES (?, ?, ?)`,
    chall_d_img_insert:`UPDATE tb_chall_detail SET chall_d_img = ? WHERE chall_d_no = ?`,
    chall_d_list   : `SELECT * FROM tb_chall_detail WHERE chall_no = ? ORDER BY chall_d_edd`,   
    chall_check    : `SELECT * FROM tb_chall_detail WHERE user_no = ? AND chall_no = ? AND DATE(chall_d_edd) = CURDATE()`,
    chall_main     : `SELECT * FROM TB_CHALLENGE ORDER BY CASE WHEN CHALL_STATUS = 1 THEN 2 ELSE 1 END,
                      ABS(DATEDIFF(CHALL_SDD, CURDATE())), CHALL_SDD`, 
                      
    // moim 공지
    inform_create  : `INSERT INTO tb_inform (inform_title, inform_con, moim_no) VALUES (?, ?, ?)`,
    inform_list    : `SELECT * FROM tb_inform WHERE moim_no = ? ORDER BY INFORM_PIN DESC, INFORM_SDD DESC`,
    inform_pin     : `UPDATE tb_inform SET inform_pin = 0 WHERE moim_no = ?`,
    inform_pinup   : `UPDATE tb_inform SET inform_pin = 1 WHERE inform_no = ?`,
    inform_pin_get : `SELECT * FROM tb_inform WHERE inform_pin = 1 AND moim_no = ?`,
    inform_delete  : `DELETE FROM tb_inform WHERE inform_no = ?`,
    inform_detail  : `SELECT * FROM tb_inform WHERE inform_no = ?`,
    inform_update  : `UPDATE tb_inform SET inform_title = ?, inform_con = ? WHERE inform_no = ?`,
 


    // 모임 가입, 탈퇴
    user_list: `SELECT * FROM tb_moim_join mj, tb_user us 
    WHERE mj.user_no = us.user_no AND mj.moim_no = ?;`,
    boss_check: `SELECT user_no FROM tb_moim WHERE moim_no = ?;`,
    moim_question: `SELECT * FROM tb_moim_question WHERE MOIM_NO = ?;`,
    moim_answer_w: `INSERT INTO tb_moim_answer (ma1, ma2, ma3, moim_no, user_no, mq_no) VALUES (?, ?, ?, ?, ?, ?);`,
    moim_answer: `SELECT aw.*, us.* FROM tb_moim_answer aw JOIN tb_user us
    ON aw.user_no = us.user_no
    WHERE aw.moim_no = ? AND aw.user_no = ? AND MA_STATUS = 0;`,      // 8-12  
    apply_list: `SELECT aw.*, us.* FROM tb_moim_answer aw JOIN tb_user us
    ON aw.user_no = us.user_no
    WHERE aw.moim_no = ? AND aw.ma_status = 0;`,    // 8-12
    accept_apply: `UPDATE tb_moim_answer SET MA_STATUS=1 WHERE moim_no = ? AND user_no = ? AND MA_STATUS = 0;`,
    deny_apply: `UPDATE tb_moim_answer SET MA_STATUS=2 WHERE moim_no = ? AND user_no IN (?) AND MA_STATUS = 0`,   // 8-12
    member_check: `SELECT * FROM tb_moim_answer
    WHERE MA_STATUS IN (0, 1)
    AND user_no = ? AND moim_no = ?;`, // 8-15
    moim_report: `INSERT INTO tb_black (user_no, moim_no, board_no, black_con) VALUES(?, ?, ?, ?);`,
    get_moim_mission: `   
    SELECT ms.MSN_TITLE, ms.MSN_GOLL, mm.MSN_CNT, mm.MSN_STATUS 
    FROM tb_moim_mission mm, tb_mission ms WHERE mm.MSN_NO = ms.MSN_NO 
    AND mm.moim_no = ?; 
    `, // 8-21



    //모임 추천
	moim_recommend:`SELECT m.* FROM tb_moim m
        LEFT JOIN (
          SELECT moim_no, COUNT(*) AS click_count
          FROM tb_click
          GROUP BY moim_no
        ) c ON m.moim_no = c.moim_no
        WHERE m.category_no = any(SELECT CATEGORY_NO 
            from tb_hobby 
            WHERE user_no = ?)
            ORDER BY c.click_count DESC LIMIT 3;`,

    // 관리자
    admin_check: `SELECT user_tp FROM tb_user WHERE user_no = ?`,
    click: `INSERT INTO tb_click (moim_no) VALUES (?)`,

    // 관리자 메인
    admin_moim_cnt: `SELECT cparent_no, count(*) as CATE_CNT FROM tb_moim GROUP BY cparent_no ORDER BY cparent_no;`,
    admin_cate_list: `SELECT * FROM tb_category WHERE CPARENT_NO IS NULL;`,
    admin_moim_like_week: `SELECT lk.moim_no, mm.moim_title, count(*) WEEK_LIKE_CNT 
    FROM tb_moim mm, tb_like lk
    WHERE lk.LIKE_SDD BETWEEN DATE_ADD(NOW(), INTERVAL -1 WEEK ) AND NOW()
    AND mm.moim_no = lk.moim_no
    GROUP BY lk.moim_no ORDER BY WEEK_LIKE_CNT DESC LIMIT 5;`,
    admin_moim_click_week: `SELECT clk.moim_no, mm.moim_title, count(*) WEEK_CLICK_CNT 
    FROM tb_moim mm, tb_click clk
    WHERE clk.CLICK_SDD BETWEEN DATE_ADD(NOW(), INTERVAL -1 WEEK ) AND NOW()
    AND mm.moim_no = clk.moim_no
    GROUP BY clk.moim_no ORDER BY WEEK_CLICK_CNT DESC LIMIT 5;`,

    // 관리자 유저
    admin_total_user_page: `SELECT count(*) page FROM tb_user`,
    admin_user_list: `SELECT * FROM tb_user`,
    admin_user_delete: `DELETE FROM tb_user WHERE user_no in `,

    // 관리자 모임
    admin_total_moim_page: `SELECT count(*) page FROM tb_moim`,
    admin_moim_list: `SELECT mm.*, us.user_no, us.user_nick, us.user_id 
    FROM tb_moim mm, tb_user us
    WHERE mm.user_no = us.user_no`,
    admin_moim_delete: `DELETE FROM tb_moim WHERE moim_no in `,

    // 관리자 신고
    admin_report_list: `SELECT bk.*, us.USER_NICK, bd.BOARD_CON, bd.MOIM_NO FROM tb_black bk 
    LEFT OUTER JOIN tb_user us ON bk.user_no = us.user_no
    LEFT OUTER JOIN tb_board bd ON bk.board_no = bd.board_no
    WHERE bk.black_status = 0 ORDER BY bk.black_ssd DESC;`,
    admin_report_process: `UPDATE tb_black SET black_status = ? `
}