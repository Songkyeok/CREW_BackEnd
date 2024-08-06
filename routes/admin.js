var express = require('express');
const router = express.Router();
var db = require('../db.js');
var sql = require('../sql.js');

// 관리자 계정 확인
router.post('/admin_check', function (request, response) {
    const user_no = request.body.user;

    db.query(sql.admin_check, [user_no], function (error, results, fields) {

        if (results[0].user_tp == 0) {
            return response.status(200).json({
                message: 'available'
            });
        }
        return response.status(200).json({
            message: 'disavailable'
        })
    })
})

// 모임 클릭 기록하기 
router.post('/click', function (request, response) {
    const moim_no = request.body.moim_no;

    db.query(sql.click, [moim_no], function (error, results, fields) {
        if (error) {
            console.error(error);
            return response.status(500).json({ error: 'click_error' });
        }
        return response.status(200).json({ message: 'complete' });
    })
})

// 카테고리별 모임 개수 가져오기
router.get('/admin_moim_cnt', function (request, response) {
    db.query(sql.admin_moim_cnt, function (error, results, fields) {
        if (error) {
            console.error(error);
            return response.status(500).json({ error: 'moim_cnt_error' });
        }
        response.json(results);
    });
});

// 카테고리 종류 가져오기
router.get('/admin_cate_list', function (request, response) {
    db.query(sql.admin_cate_list, function (error, results, fields) {
        if (error) {
            console.error(error);
            return response.status(500).json({ error: 'moim_cnt_error' });
        }
        response.json(results);
    });
})

// 모임 좋아요 상위 순위 가져오기
router.get('/admin_moim_like_week', function (request, response) {
    db.query(sql.admin_moim_like_week, function (error, results, fields) {
        if (error) {
            console.error(error);
            return response.status(500).json({ error: 'moim_rank_error' });
        }
        response.json(results);
    });
})

// 모임 클릭 상위 순위 가져오기
router.get('/admin_moim_click_week', function (request, response) {
    db.query(sql.admin_moim_click_week, function (error, results, fields) {
        if (error) {
            console.error(error);
            return response.status(500).json({ error: 'moim_rank_error' });
        }
        response.json(results);
    });
})




// 유저 페이지 수 가져오기
router.post('/admin_total_user_page/:keyword/:sort', function (request, response) {
    let pageCnt = 10;
    const sort = request.params.sort;
    const keyword = request.params.keyword;
    let order = '';

    if (keyword != ' ') {
        order += ` WHERE user_nick LIKE '%${keyword}%' OR user_id LIKE '%${keyword}%' `
    }

    if (sort == 1) {
        order += ` ORDER BY user_no DESC `
    } else {
        order += ` ORDER BY user_no `
    }

    db.query(sql.admin_total_user_page + order, function (error, results, fields) {
        if (error) {
            console.error(error);
            return response.status(500).json({ error: 'page_error' });
        }
        return response.status(200).json({
            page: Math.ceil((results[0].page) / pageCnt)
        })
    })
})

// 유저 정보 가져오기
router.get('/admin_user_list/:sort/:keyword/:page', function (request, response) {
    let pageCnt = 10;
    const sort = request.params.sort;
    const keyword = request.params.keyword;
    const page = request.params.page;
    let order = '';


    if (keyword != ' ') {
        order += ` WHERE user_nick LIKE '%${keyword}%' OR user_id LIKE '%${keyword}%' `
    }

    if (sort == 1) {
        order += ` ORDER BY user_no DESC `
    } else {
        order += ` ORDER BY user_no `
    }

    order += ` LIMIT ${(page - 1) * pageCnt}, ${pageCnt} `



    db.query(sql.admin_user_list + order, function (error, results, fields) {
        if (error) {
            console.error(error);
            return response.status(500).json({ error: 'user_list_error' });
        }
        response.json(results);
    });
});

// 유저 삭제하기
router.post('/admin_user_delete', function (request, response) {
    const userList = request.body.userList

    let order = '('

    for (let i = 0; i < userList.length; i++) {
        if (i == userList.length - 1) {
            order += `${userList[i]})`
        }
        else {
            order += `${userList[i]},`
        }
    }

    db.query(sql.admin_user_delete + order, function (error, results, fields) {
        if (error) {
            console.error(error);
            return response.status(500).json({ error: 'user_delete_error' });
        }
        return response.status(200).json({ message: 'complete' })
    })
})





// 모임 페이지 수 가져오기
router.post('/admin_total_moim_page/:keyword/:sort', function (request, response) {
    let pageCnt = 10;
    const sort = request.params.sort;
    const keyword = request.params.keyword;
    let order = '';

    if (keyword != ' ') {
        order += ` WHERE moim_title LIKE '%${keyword}%' `
    }
    
    if (sort == 1) {
        order += ` ORDER BY moim_no DESC `
    } else if (sort == 2) {
        order += ` ORDER BY moim_no `
    } else if (sort == 3) {
        order += ` ORDER BY moim_cnt DESC`
    } else if (sort == 4) {
        order += ` ORDER BY like_cnt DESC`
    } 

    db.query(sql.admin_total_moim_page + order, function (error, results, fields) {
        if (error) {
            console.error(error);
            return response.status(500).json({ error: 'page_error' });
        }
        return response.status(200).json({
            page: Math.ceil((results[0].page) / pageCnt)
        })
    })
})

// 모임 정보 가져오기
router.get('/admin_moim_list/:sort/:keyword/:page', function (request, response) {
    let pageCnt = 10;
    const sort = request.params.sort;
    const keyword = request.params.keyword;
    const page = request.params.page;
    let order = '';

    if (keyword != ' ') {
        order += ` AND moim_title LIKE '%${keyword}%' `
    }

    if (sort == 1) {
        order += ` ORDER BY moim_no DESC `
    } else if (sort == 2) {
        order += ` ORDER BY moim_no `
    } else if (sort == 3) {
        order += ` ORDER BY moim_cnt DESC`
    } else if (sort == 4) {
        order += ` ORDER BY like_cnt DESC`
    } 

    order += ` LIMIT ${(page - 1) * pageCnt}, ${pageCnt} `

    db.query(sql.admin_moim_list + order, function (error, results, fields) {
        if (error) {
            console.error(error);
            return response.status(500).json({ error: 'moim_list_error' });
        }
        response.json(results);
    });
});

// 모임 삭제하기
router.post('/admin_moim_delete', function (request, response) {
    const moimList = request.body.moimList

    let order = '('

    for (let i = 0; i < moimList.length; i++) {
        if (i == moimList.length - 1) {
            order += `${moimList[i]})`
        }
        else {
            order += `${moimList[i]},`
        }
    }

    db.query(sql.admin_moim_delete + order, function (error, results, fields) {
        if (error) {
            console.error(error);
            return response.status(500).json({ error: 'moim_delete_error' });
        }
        return response.status(200).json({ message: 'complete' })
    })
})



// 신고 정보 가져오기
router.get('/admin_report_list/:sort', function (request, response) {
    const sort = request.params.sort;

    db.query(sql.admin_report_list, function (error, results, fields) {
        if (error) {
            console.error(error);
            return response.status(500).json({ error: 'moim_list_error' });
        }
        response.json(results);
    });
});

// 신고 처리하기
router.post('/admin_report_process', function (request, response) {
    const reportList = request.body.reportList;
    const type = request.body.type;

    let order = 'WHERE black_no IN ('

    if (!Array.isArray(reportList)) {
        order += `${reportList})`
    }

    for (let i = 0; i < reportList.length; i++) {
        if (i == reportList.length - 1) {
            order += `${reportList[i]})`
        }
        else {
            order += `${reportList[i]}, `
        }
    }

    db.query(sql.admin_report_process + order, [type], function (error, results, fields) {
        if (error) {
            console.error(error);
            return response.status(500).json({ error: 'moim_delete_error' });
        }
        return response.status(200).json({ message: 'complete' })
    })
})


module.exports = router;