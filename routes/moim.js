var express = require('express');
const router = express.Router();
var db = require('../db.js');
var sql = require('../sql.js');

const fs = require('fs');
const path = require("path");
const multer = require('multer');

function listSort(sortCase) {
    let moimlist = ` ORDER BY MOIM_NO DESC`; // 최신순

    if (sortCase == 1) { // 예술
        moimlist = ` WHERE CPARENT_NO = 100`;
    }
    else if (sortCase == 2) { // 푸드 
        moimlist = ` WHERE CPARENT_NO = 200`;
    }
    else if (sortCase == 3) { // 운동 
        moimlist = ` WHERE CPARENT_NO = 300`;
    }
    else if (sortCase == 4) { // 여행 
        moimlist = ` WHERE CPARENT_NO = 400`;
    }
    else if (sortCase == 5) {  // 기타
        moimlist = ` WHERE CPARENT_NO = 500`;
    }
    return moimlist;
}

const upload = multer({
    storage: multer.diskStorage({
        destination(req, file, cb) {
            cb(null, 'uploads/');
        },
        filename(req, file, cb) {
            cb(null, file.originalname);
        },
    }),
    limits: { fileSize: 5 * 1024 * 1024 },
});

// 이미지 등록 
router.post('/upload_img', upload.single('img'), (request, response) => {
    setTimeout(() => {
        return response.status(200).json({
            message: 'success'
        })
    }, 2000);
})

// 이미지 제거
router.post('/delete_img', (request, response) => {
    const pastname = request.body.pastname;
    try {
        if (pastname != "" && fs.existsSync(path.normalize(`${__dirname}/../uploads/${pastname}`))) {
            fs.unlinkSync(path.normalize(`${__dirname}/../uploads/${pastname}`))
        }
    }
    catch (error) {
        console.log(error)
    }
})

// 모임 만들기
router.post('/moim_create', function (request, response, next) {
    const form = request.body;

    let mq = [null, null, null]

    for (let i = 1; i < form.mq.length; i++) {
        mq[i - 1] = form.mq[i];
    }

    db.query(sql.moim_create, [form.moim_title, form.moim_intro, form.moim_con, form.moim_adr, form.moim_max, form.user_no, form.category_no, form.cparent_no, form.category_nm],
        function (error, results, fields) {
            if (error) {
                console.error(error);
                return response.status(500).json({ error: 'error1' });
            }
            const moimNo = results.insertId;

            console.log("모임 생성")
            db.query(sql.get_moim_no, [form.moim_title], function (error, results, fields) {
                if (error) {
                    console.error(error);
                    return response.status(500).json({ error: 'error2' });
                }
                const filename = results[0].moim_no;
                const pastDir = `${__dirname}` + `/../uploads/` + form.moim_img;
                const newDir = `${__dirname}` + `/../uploads/uploadMoim/`;
                const extension = form.moim_img.substring(form.moim_img.lastIndexOf('.'));
                fs.rename(pastDir, newDir + filename + extension, (err) => {
                    if (err) {
                        return response.status(500).json({ error: 'error3' });
                    } else {
                        db.query(sql.moim_img_insert, [filename + extension, results[0].moim_no], function (error, results, fields) {
                            if (error) {
                                return response.status(500).json({ error: 'error4' });
                            }

                            db.query(sql.moim_q_insert, [moimNo, mq[0], mq[1], mq[2]], function (error, results, fields) {
                                if (error) {
                                    console.log(error);
                                    return response.status(500).json({ error: 'error5' });
                                }
                                console.log("질문입력")
                            });
                        });
                    }
                });

                // 모임장 정보 MOIM JOIN테이블에 저장하기
                db.query(sql.moim_join_first, [filename, form.user_no], function (error, results, fields) {
                    console.log("조인 확인")
                    if (error) {
                        console.error(error);
                        return response.status(500).json({ error: 'join_error' });
                    }
                    return response.status(200).json({
                        message: 'success'
                    });
                });
            });
        }
    );
});

// 지역구 불러오기
router.get('/zone', function (request, response, next) {
    db.query(sql.zone, function (error, results, fields) {
        if (error) {
            console.error(error);
            return response.status(500).json({ error: 'error' });
        }
        response.json(results);
    });
});

// 카테고리 소분류
router.get('/cate/:cate', function (request, response, next) {
    const category = request.params.cate;

    db.query(sql.category, [category], function (error, results, fields) {
        if (error) {
            console.error(error);
            return response.status(500).json({ error: 'error' });
        }
        response.json(results);
    });
});

// main 모임 리스트
router.get('/moim_list/:sortCase', function (request, response, next) {
    const moimlist = listSort(request.params.sortCase);

    db.query(sql.moim_list + moimlist, function (error, results, fields) {
        if (error) {
            console.error(error);
            return response.status(500).json({ error: 'error' });
        }
        response.json(results);
    });
});

// 내 모임 리스트
router.get('/my_moim_list/:user_no', function (request, response, next) {
    const user_no = request.params.user_no

    db.query(sql.my_moim_list, [user_no], function (error, results, fields) {
        if (error) {
            console.error(error);
            return response.status(500).json({ error: 'error' });
        }
        response.json(results);
    });
});

// 좋아요 누르기
router.post('/like', function (request, response) {
    const moim_no = request.body.moim_no;
    const user_no = request.body.user_no;

    db.query(sql.like, [moim_no, user_no], function (error, results, fields) {
        if (error) {
            console.error(error);
            return response.status(500).json({ error: 'error' });
        }
        return response.status(200).json({ message: 'complete' });
    });
});

// 좋아요 취소하기
router.post('/dislike', function (request, response) {
    const moim_no = request.body.moim_no;
    const user_no = request.body.user_no;

    db.query(sql.like_check, [moim_no, user_no], function (error, results, fields) {
        if (error) {
            console.error(error);
            return response.status(500).json({ error: 'error' });
        }
        else if (results.length <= 0) {
            // 좋아요 안 누른 경우 
            return response.status(200).json({ message: 'complete' });
        }
        db.query(sql.dislike, [moim_no, user_no], function (error, results, fields) {
            if (error) {
                console.error(error);
                return response.status(500).json({ error: 'error' });
            }
            return response.status(200).json({ message: 'complete' });
        });
    })
});

// 좋아요 불러오기 0810
router.get('/like_moim/:user_no', function (request, response, next) {
    const user_no = request.params.user_no;

    db.query(sql.like_moim, [user_no], function (error, results, fields) {
        if (error) {
            console.error(error);
            return response.status(500).json({ error: 'error' });
        }
        response.json(results);
    });
});

// 모임 상세보기
router.get('/moim_detail/:moim_no', function (request, response, next) {
    const moim_no = request.params.moim_no;

    db.query(sql.moim_detail, [moim_no], function (error, results, fields) {
        if (error) {
            console.error(error);
            return response.status(500).json({ error: 'error' });
        }
        response.json(results);
    });
});

// 모임 추천
router.get('/moim_suggest/:moim_no', function (request, response, next) {
    const moim_no = request.params.moim_no;

    db.query(sql.moim_suggest, [moim_no, moim_no], function (error, results, fields) {
        if (error) {
            console.error(error);
            return response.status(500).json({ error: 'error' });
        }
        response.json(results);
    });
});

// 유저 추천모임
router.get('/recommend_moim_list/:user_no', function (request, response, next) {
    const user_no = request.params.user_no

    db.query(sql.moim_recommend, [user_no], function (error, results, fields) {
        if (error) {
            console.error(error);
            return response.status(500).json({ error: 'error' });
        }
        response.json(results);

    });
});


// 모임 공지사항 글쓰기
router.post('/inform_create', function (request, response, next) {
    const data = request.body;
    db.query(sql.inform_create, [data.inform_title, data.inform_con, data.moim_no], function (error, results, fields) {
        if (error) {
            console.log(error);
            return response.status(500).json({ error: 'error' });
        }
        return response.status(200).json({
            message: 'success'
        });
    })
});

// 모임 공지사항 리스트
router.get('/inform_list/:moim_no', function (request, response, next) {
    const moim_no = request.params.moim_no;

    db.query(sql.inform_list, [moim_no], function (error, results, fields) {
        if (error) {
            console.error(error);
            return response.status(500).json({ error: 'error' });
        }
        response.json(results);
    });
});

// 모임 공지사항 고정
router.post('/inform_pin', function (request, response, next) {
    const inform = request.body;

    db.query(sql.inform_pin, [inform.moim_no], function (error, results, fields) {
        if (error) {
            console.error("핀번호 바꾸기 전 오류" + error);
            return response.status(500).json({ error: 'error' });
        }
        db.query(sql.inform_pinup, [inform.inform_no], function (error, results, fields) {
            if (error) {
                console.error("핀번호 바꿀때 오류" + error);
                return response.status(500).json({ error: 'error' });
            }
            return response.status(200).json({
                message: 'success'
            });
        })
    });
});

// 모임 공지사항 고정 가져오기
router.get('/inform_pin_get/:moim_no', function (request, response, next) {
    const moim_no = request.params.moim_no;

    db.query(sql.inform_pin_get, [moim_no], function (error, results) {
        if (error) {
            console.error(error);
            return response.status(500).json({ error: 'error' });
        }
        response.json(results);
    })
})

// 모임 공지사항 삭제
router.get('/inform_delete/:inform_no', function (request, response, next) {
    const inform_no = request.params.inform_no;

    db.query(sql.inform_delete, [inform_no], function (error, results, fields) {
        if (error) {
            console.error(error);
            return response.status(500).json({ error: 'error' });
        }
        response.json(results);
    });
});

// 모임 공지사항 디테일
router.get('/inform_detail/:inform_no', function (request, response, next) {
    const inform_no = request.params.inform_no;

    db.query(sql.inform_detail, [inform_no], function (error, results, fields) {
        if (error) {
            console.error(error);
            return response.status(500).json({ error: 'error' });
        }
        response.json(results);
    });
});


// 모임 공지사항 수정하기
router.post('/inform_update', function (request, response, next) {
    const data = request.body;

    db.query(sql.inform_update, [data.inform_title, data.inform_con, data.inform_no], function (error, results, fields) {
        if (error) {
            console.log(error);
            return response.status(500).json({ error: 'error' });
        }
        return response.status(200).json({
            message: 'success'
        });
    })
})

// 방장 user 이미지, 닉네임 가져오기
router.get('/user_img_get/:moim_no', function (request, response, next) {
    const moim_no = request.params.moim_no;

    db.query(sql.user_img_get, [moim_no], function (error, results, fields) {
        if (error) {
            console.error(error);
            return response.status(500).json({ error: 'error' });
        }
        response.json(results);
    })
})

// 모임 유저 리스트
router.get('/user_list/:moim', function (request, response, next) {
    const moim_no = request.params.moim;

    db.query(sql.user_list, [moim_no], function (error, results, fields) {
        if (error) {
            console.error(error);
            return response.status(500).json({ error: '회원에러' });
        }
        response.json(results);
    });
});

// 모임 유저 체크
router.post('/moim_j_check', function (request, response) {
    const data = request.body;

    console.log(data);

    db.query(sql.moim_j_check, [data.moim_no, data.user_no], function (error, results, fields) {
        if (error) {
            console.error(error);
            return response.status(500).json({ error: '에러' });
        }

        if (results.length > 0) {
            return response.status(200).json({
                message: results[0].user_no
            });
        } else {
            return response.status(200).json({message: ''});
        }
    });
});



router.post('/upload_imgs', upload.array('imgs', 5), (request, response) => {
    return response.status(200).json({
        message: 'success'
    });
});

// 게시물 글쓰기
router.post('/post_write', function (request, response, next) {
    const form = request.body;
    const calno = form.cal_no !== '' ? form.cal_no : null;

    db.query(sql.post_write, [form.board_con, form.moim_no, form.user_no, calno],
        function (error, results, fields) {
            if (error) {
                console.error(error);
                return response.status(500).json({ error: 'error1' });
            }

            if (!form.board_img || form.board_img.length === 0) {
                return response.status(200).json({
                    message: 'success'
                });
            }

            const board_no = results.insertId;
            const newDir = `${__dirname}` + `/../uploads/uploadBoard/`;

            for (let index = 0; index < form.board_img.length; index++) {
                const imgName = form.board_img[index];
                const filename = board_no;

                const pastDir = `${__dirname}` + `/../uploads/` + imgName;

                const extension = path.extname(imgName);

                fs.rename(pastDir, newDir + filename + '-' + index + extension, (err) => {
                    if (err) {
                        return response.status(500).json({ error: 'error3' });
                    } else {
                        db.query(sql.board_img_insert, [filename + '-' + index + extension, board_no], function (error, results, fields) {
                            if (error) {
                                return response.status(500).json({ error: 'error4' });
                            }
                            if (index === form.board_img.length - 1) {
                                return response.status(200).json({
                                    message: 'success'
                                });
                            }
                        });
                    }
                });
            }
        }
    );
});


// 게시물 리스트
router.get('/post_list/:moim_no', function (request, response, next) {
    const moim_no = request.params.moim_no;

    db.query(sql.post_list, [moim_no], function (error, results, fields) {
        if (error) {
            console.error(error);
            return response.status(500).json({ error: 'error' });
        }
        response.json(results);
    });
});

// 게시물 이미지 리스트
router.get('/post_img_list/:board_no', function (request, response, next) {
    const board_no = request.params.board_no;

    db.query(sql.post_img_list, [board_no], function (error, results, fields) {
        if (error) {
            console.error(error);
            return response.status(500).json({ error: 'error' });
        }
        response.json(results);
    });
});

// 게시물 고정
router.post('/post_pin', function (request, response, next) {
    const post = request.body;

    db.query(sql.post_pin, [post.moim_no], function (error, results, fields) {
        if (error) {
            console.error("핀번호 바꾸기 전 오류" + error);
            return response.status(500).json({ error: 'error' });
        }
        db.query(sql.post_pinup, [post.board_no], function (error, results, fields) {
            if (error) {
                console.error("핀번호 바꿀때 오류" + error);
                return response.status(500).json({ error: 'error' });
            }
            return response.status(200).json({
                message: 'success'
            });
        })
    });
});

// 게시물 고정 가져오기
router.get('/post_pin_get/:moim_no', function (request, response, next) {
    const moim_no = request.params.moim_no;

    db.query(sql.post_pin_get, [moim_no], function (error, results) {
        if (error) {
            console.error(error);
            return response.status(500).json({ error: 'error' });
        }
        response.json(results);
    })
})

// 게시물 댓글 작성
router.post('/post_cmt_write', function (request, response, next) {
    const data = request.body;

    db.query(sql.post_cmt_write, [data.board_cmt_con, data.board_no, data.user_no], function (error, results, fields) {
        if (error) {
            console.log(error);
            return response.status(500).json({ error: 'error' });
        }
        return response.status(200).json({
            message: 'success'
        });
    })
})

// 게시물 댓글 삭제
router.get('/post_cmt_delete/:board_cmt_no', function (request, response, next) {
    const board_cmt_no = request.params.board_cmt_no;

    db.query(sql.post_cmt_delete, [board_cmt_no], function (error, results, fields) {
        if (error) {
            console.error(error);
            return response.status(500).json({ error: 'error' });
        }
        response.json(results);
    });
});

// 게시물 댓글 리스트
router.get('/post_cmt_list/:board_no', function (request, response, next) {
    const board_no = request.params.board_no;

    db.query(sql.post_cmt_list, [board_no], function (error, results, fields) {
        if (error) {
            console.error(error);
            return response.status(500).json({ error: 'error' });
        }
        response.json(results);
    });
});

// 게시물 좋아요 누르기
router.post('/post_like', function (request, response) {
    const data = request.body;

    db.query(sql.post_like, [data.board_no, data.user_no], function (error, results, fields) {
        if (error) {
            console.error(error);
            return response.status(500).json({ error: 'error' });
        }
        return response.status(200).json({ message: 'complete' });
    });
});

// 게시물 좋아요 취소하기
router.post('/post_dislike', function (request, response) {
    const data = request.body;

    db.query(sql.post_like_check, [data.board_no, data.user_no], function (error, results, fields) {
        if (error) {
            console.error(error);
            return response.status(500).json({ error: 'error' });
        }
        else if (results.length <= 0) {
            // 좋아요 안 누른 경우 
            return response.status(200).json({ message: 'complete' });
        }
        db.query(sql.post_dislike, [data.board_no, data.user_no], function (error, results, fields) {
            if (error) {
                console.error(error);
                return response.status(500).json({ error: 'error' });
            }
            return response.status(200).json({ message: 'complete' });
        });
    })
});

// 게시물 좋아요 불러오기
router.get('/post_like_list/:user_no', function (request, response, next) {
    const user_no = request.params.user_no;

    db.query(sql.post_like_list, [user_no], function (error, results, fields) {
        if (error) {
            console.error(error);
            return response.status(500).json({ error: 'error' });
        }
        response.json(results);
    });
});

// 게시물 삭제하기
router.get('/post_delete/:board_no', function (request, response, next) {
    const board_no = request.params.board_no;

    db.query(sql.post_delete, [board_no], function (error, results, fields) {
        if (error) {
            console.error(error);
            return response.status(500).json({ error: 'error' });
        }
        response.json(results);
    });
});

// 게시물 수정하기
router.post('/post_update', function (request, response, next) {
    const data = request.body;
    const calno = data.cal_no !== '' ? data.cal_no : null;

    db.query(sql.post_update, [data.board_con, calno, data.board_no], function (error, results, fields) {
        if (error) {
            console.log(error);
            return response.status(500).json({ error: 'error' });
        }
        return response.status(200).json({
            message: 'success'
        });
    })
})

// 게시물 디테일
router.get('/post_detail/:board_no', function (request, response, next) {
    const board_no = request.params.board_no;

    db.query(sql.post_detail, [board_no], function (error, results, fields) {
        if (error) {
            console.error(error);
            return response.status(500).json({ error: 'error' });
        }
        response.json(results);
    });
});



// 일정 등록
router.post('/calendar_create', function (request, response, next) {
    const data = request.body;

    db.query(sql.calendar_create, [data.cal_nm, data.cal_sdd, data.cal_edd, data.moim_no], function (error, results, fields) {
        if (error) {
            console.log(error);
            return response.status(500).json({ error: 'error' });
        }
        return response.status(200).json({
            message: 'success'
        });
    })
})

// 일정 목록
router.get('/calendar_list/:moim_no', function (request, response, next) {
    const moim_no = request.params.moim_no;

    db.query(sql.calendar_list, [moim_no], function (error, results, fields) {
        if (error) {
            console.error(error);
            return response.status(500).json({ error: 'error' });
        }
        response.json(results);
    });
});

// 일정 참가
router.post('/calendar_join', function (request, response, next) {
    const data = request.body;

    db.query(sql.calendar_j_check, [data.cal_no, data.user_no], function (error, results, fields) {
        if (error) {
            console.error(error);
            return response.status(500).json({ error: 'error' });
        }

        if (results.length === 0) {
            db.query(sql.calendar_join, [data.cal_no, data.moim_no, data.user_no], function (error, results, fields) {
                if (error) {
                    return response.status(500).json({ error: 'error' });
                }
                response.json(results);
            });
        } else {
            response.status(400).json({ error: 'joined' });
        }
    });
});

// 일정 참가 유저 정보
router.get('/calendar_j_info/:moim_no', function (request, response, next) {
    const moim_no = request.params.moim_no;

    db.query(sql.calendar_j_info, [moim_no], function (error, results, fields) {
        if (error) {
            console.error(error);
            return response.status(500).json({ error: 'error' });
        }
        response.json(results);
    });
});



// 챌린지 이미지
router.post('/upload_img2', upload.single('img2'), (request, response) => {
    try {
        return response.status(200).json({
            message: 'success'
        });
    } catch (error) {
        console.error(error);
        return response.status(500).json({
            message: 'error'
        });
    }
});

// 챌린지 만들기
router.post('/chall_create', function (request, response, next) {
    const data = request.body;
    db.query(sql.chall_create, [data.chall_title, data.chall_con, data.chall_sdd, data.chall_edd, data.chall_cnt, data.moim_no], function (error, results, fields) {
        if (error) {
            console.log(error);
            return response.status(500).json({ error: 'error' });
        }

        const chall_no = results.insertId;
        console.log(chall_no)

        const filename = chall_no;
        const pastDir = `${__dirname}` + `/../uploads/` + data.chall_img;
        const newDir = `${__dirname}` + `/../uploads/uploadChall/`;
        const extension = data.chall_img.substring(data.chall_img.lastIndexOf('.'));
        fs.rename(pastDir, newDir + filename + extension, (err) => {
            if (err) {
                return response.status(500).json({ error: 'error3' });
            } else {
                db.query(sql.chall_img_insert, [filename + extension, chall_no], function (error, results, fields) {
                    if (error) {
                        return response.status(500).json({ error: 'error4' });
                    }

                    return response.status(200).json({
                        message: 'success'
                    });
                })
            }
        });
    }
    );
});

// 챌린지 리스트
router.get('/chall_list/:moim_no', function (request, response, next) {
    const moim_no = request.params.moim_no;

    db.query(sql.chall_list, [moim_no], function (error, results, fields) {
        if (error) {
            console.error(error);
            return response.status(500).json({ error: 'error' });
        }
        response.json(results);
    });
});

// 챌린지 디테일
router.get('/chall_detail/:chall_no', function (request, response, next) {
    const chall_no = request.params.chall_no;

    db.query(sql.chall_detail, [chall_no], function (error, results, fields) {
        if (error) {
            console.error(error);
            return response.status(500).json({ error: 'error' });
        }
        response.json(results);
    });
});

// 챌린지 인증글 작성
router.post('/chall_d_create', function (request, response, next) {
    const data = request.body;

    db.query(sql.chall_d_create, [data.chall_d_con, data.chall_no, data.user_no], function (error, results, fields) {
        if (error) {
            console.log(error);
            return response.status(500).json({ error: 'error' });
        }

        const chall_d_no = results.insertId;

        if (data.chall_d_img) {
            const filename = chall_d_no;
            const pastDir = `${__dirname}` + `/../uploads/` + data.chall_d_img;
            const newDir = `${__dirname}` + `/../uploads/uploadChallDetail/`;
            const extension = data.chall_d_img.substring(data.chall_d_img.lastIndexOf('.'));
            fs.rename(pastDir, newDir + filename + extension, (err) => {
                if (err) {
                    return response.status(500).json({ error: 'error3' });
                } else {
                    db.query(sql.chall_d_img_insert, [filename + extension, chall_d_no], function (error, results, fields) {
                        if (error) {
                            return response.status(500).json({ error: 'error4' });
                        }

                        return response.status(200).json({
                            message: 'success'
                        });
                    });
                }
            });
        } else {
            return response.status(200).json({
                message: 'success'
            });
        }
    });
});

// 챌린지 인증글 리스트
router.get('/chall_d_list/:chall_no', function (request, response, next) {
    const chall_no = request.params.chall_no;

    db.query(sql.chall_d_list, [chall_no], function (error, results, fields) {
        if (error) {
            console.error(error);
            return response.status(500).json({ error: 'error' });
        }
        response.json(results);
    });
});

// 챌린지 인증 체크
router.get('/chall_check/:user_no/:chall_no', function (request, response, next) {
    const user_no = request.params.user_no;    
    const chall_no = request.params.chall_no;

    db.query(sql.chall_check, [user_no, chall_no], function (error, results, fields) {
        if (error) {
            console.error(error);
            return response.status(500).json({ error: 'error' });
        }

        if (results.length > 0) {
            return response.status(200).send('1');
        } else {
            return response.status(200).send('0');
        }
    });
});


// 모임 수정하기
router.post('/moim_update', function (request, response, next) {
    const form = request.body;

    let mq = [null, null, null]

    for (let i = 1; i < form.mq.length; i++) {
        mq[i - 1] = form.mq[i];
    }

    db.query(sql.moim_update, [form.moim_title, form.moim_intro, form.moim_con, form.moim_adr, form.moim_max, form.category_no, form.cparent_no, form.category_nm, form.moim_no],
        function (error, results, fields) {
            if (error) {
                console.error("1" + error);
                return response.status(500).json({ error: 'error1' });
            }

            if (form.moim_img) {

                const filename = form.moim_no;


                const pastDir = `${__dirname}` + `/../uploads/` + form.moim_img;
                const newDir = `${__dirname}` + `/../uploads/uploadMoim/`;
                const extension = form.moim_img.substring(form.moim_img.lastIndexOf('.'));

                fs.rename(pastDir, newDir + filename + extension, (err) => {
                    if (err) {
                        console.error("2" + error);
                        return response.status(500).json({ error: 'error2' });
                    } else {
                        db.query(sql.moim_img_insert, [filename + extension, form.moim_no], function (error, results, fields) {
                            if (error) {
                                console.error("3" + error);
                                return response.status(500).json({ error: 'error3' });
                            }

                            db.query(sql.moim_q_update, [mq[0], mq[1], mq[2], form.moim_no], function (error, results, fields) {
                                if (error) {
                                    console.log(error);
                                    return response.status(500).json({ error: 'error5' });
                                }
                                return response.status(200).json({
                                    message: 'success'
                                });
                            });
                        });
                    }
                });
            }
            else {
                return response.status(200).json({
                    message: 'success'
                });
            }

        }
    );
});


// 모임 삭제
router.post('/moim_delete', function (request, response, next) {
    const moim_no = request.body.moim_no;

    let img = null;

    db.query(sql.get_moim_img, [moim_no], function (error, results, fields) {
        if (error) {
            return response.status(500).json({ error: 'error1' });
        }
        img = results[0].moim_img;
    });

    db.query(sql.moim_delete, [moim_no], function (error, results, fields) {
        if (error) {
            return response.status(500).json({ error: 'error1' });
        }

        if (fs.existsSync(path.normalize(`${__dirname}/../uploads/uploadMoim/${img}`))) {
            fs.unlinkSync(path.normalize(`${__dirname}/../uploads/uploadMoim/${img}`))
        }

        return response.status(200).json({
            message: 'success'
        });

    }
    );
});






// 모임 가입 질문 불러오기
router.get('/moim_question/:moim_no', function (request, response, next) {
    const moim_no = request.params.moim_no;

    db.query(sql.moim_question, [moim_no], function (error, results, fields) {
        if (error) {
            console.error(error);
            return response.status(500).json({ error: 'error' });
        }
        response.json(results);
    })
})

// 모임 가입 질문 답변 작성하기
router.post('/moim_answer_w', function (request, response, next) {
    const moim_no = request.body.moim_no;
    let answer = request.body.answer;
    const user_no = request.body.user_no;
    const mq_no = request.body.question;

    db.query(sql.moim_answer_w, [answer[0], answer[1], answer[2], moim_no, user_no, mq_no], function (error, results, fields) {
        if (error) {
            console.error(error);
            return response.status(500).json({ error: 'answer_write_error' });
        }
        return response.status(200).json({
            message: 'success'
        });
    });
});

// 모임 가입 신청 리스트 불러오기
router.get('/apply_list/:moim', function (request, response, next) {
    const moim_no = request.params.moim;

    db.query(sql.apply_list, [moim_no], function (error, results, fields) {
        if (error) {
            console.error(error);
            return response.status(500).json({ error: '신청 리스트 조회 에러' });
        }
        response.json(results);
    });
});

// 모임 가입 답변 불러오기
router.get('/moim_answer/:moim_no/:user_no', function (request, response, next) {
    const moim_no = request.params.moim_no;
    const user_no = request.params.user_no;

    db.query(sql.moim_answer, [moim_no, user_no], function (error, results, fields) {
        if (error) {
            console.error(error);
            return response.status(500).json({ error: 'error' });
        }
        response.json(results);
    })
})

// 모임 가입 승인하기
router.post('/accept_apply', function (request, response, next) {
    const moim_no = request.body.moim_no;
    const user_no = request.body.user_no;

    db.query(sql.accept_apply, [moim_no, user_no], function (error, results, fields) {
        if (error) {
            console.error(error);
            return response.status(500).json({ error: 'accept_apply_error' });
        }
        return response.status(200).json({
            message: 'complete'
        });
    });
});

// 모임 가입 거부하기
router.post('/deny_apply', function (request, response, next) {
    const moim_no = request.body.moim_no;
    const user_no = request.body.user_no;

    db.query(sql.deny_apply, [moim_no, user_no], function (error, results, fields) {
        if (error) {
            console.error(error);
            return response.status(500).json({ error: 'deny_apply_error' });
        }
        return response.status(200).json({
            message: 'complete'
        });
    });
});

// 모임 멤버 여부 확인하기
router.post('/member_check', function (request, response, next) {
    const moim_no = request.body.moim_no;
    const user_no = request.body.user_no;

    db.query(sql.member_check, [user_no, moim_no], function (error, results, fields) {
        if (error) {
            console.error(error);
            return response.status(500).json({ error: 'member_check_error' });
        }
        else if (results.length <= 0) {
            return response.status(200).json({
                message: 'avaliable'
            });
        }
        return response.status(200).json({
            message: 'disavaliable'
        });
    });
});

// 신고하기
router.post('/member_report', function (request, response, next) {
    const user_no = request.body.user_no;
    const moim_no = request.body.moim_no;
    const board_no = request.body.board_no;

    const black_con = request.body.black_con;   // 신고 사유

    db.query(sql.moim_report, [user_no, moim_no, board_no, black_con], function (error, results, fields) {
        if (error) {
            console.error(error);
            return response.status(500).json({ error: 'member_report_error' });
        }
        return response.status(200).json({
            message: 'complete'
        });
    });
});



// 모임 미션 달성 현황 가져오기
router.get('/get_moim_mission/:moim', function (request, response, next) {
    const moim_no = request.params.moim;

    db.query(sql.get_moim_mission, [moim_no], function (error, results, fields) {
        if (error) {
            console.error(error);
            return response.status(500).json({ error: '모임 달성 현황 조회 에러' });
        }
        response.json(results);
    });
});



// 챌린지 메인
router.get('/chall_main', function (request, response, next) {
    db.query(sql.chall_main, function (error, results, fields) {
        if (error) {
            console.error(error);
            return response.status(500).json({ error: 'error' });
        }
        response.json(results);
    });
});


module.exports = router;