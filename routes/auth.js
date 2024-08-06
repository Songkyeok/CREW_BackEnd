var express = require('express');
const router = express.Router();
var db = require('../db.js');
var sql = require('../sql.js');
const fs = require('fs');
const path = require("path");
const multer = require('multer');
const bcrypt = require('bcrypt');

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
    setTimeout(() => {
        return response.status(200).json({
            message: 'success'
        })
    }, 2000);
})








// 검색하기 
router.post('/search', function (request, response, next) {
    const user_no = request.body.user;
    const search_kw = request.body.keyword;

    db.query(sql.search, [user_no, search_kw], function (error, results, fields) {
        if (error) {
            console.error(error);
            return response.status(500).json({
                error: 'DB error'
            })
        }
        return response.status(200).json({
            message: 'complete'
        })
    })
})

// 내 최근 검색어 불러오기
router.get('/search_mine_get/:user', function (request, response, next) {
    const user_no = request.params.user
    db.query(sql.search_mine_get, [user_no], function (error, results, fields) {
        if (error) {
            console.error(error);
            return response.status(500).json({
                error: 'DB error'
            })
        }
        response.json(results);
    })
})

// 내 검색어 삭제하기
router.post('/search_delete', function (request, response, next) {
    const search_no = request.body.search_no;

    db.query(sql.search_delete, [search_no], function (error, results, fields) {
        if (error) {
            console.error(error);
            return response.status(500).json({
                error: 'DB error'
            })
        }
        return response.status(200).json({
            message: 'complete'
        })
    })
})

// 인기 검색어 불러오기
router.get('/search_hot_get', function (request, response, next) {
    db.query(sql.search_hot_get, function (error, results, fields) {
        if (error) {
            console.error(error);
            return response.status(500).json({
                error: 'DB error'
            })
        }
        response.json(results);
    })
})

// 검색 정렬 방식 
function sortCaseReplace(sortCase) {
    if (sortCase == 1) {
        return ' ORDER BY moim_sdd DESC'
    }
    else if (sortCase == 2) {
        return ' ORDER BY like_cnt DESC'
    }
}

// 검색 리스트
router.get('/search_list/:keyword/:sortCase', function (request, response, next) {
    const keyword = '%' + request.params.keyword + '%';
    const sortCase = request.params.sortCase;

    const order = sortCaseReplace(sortCase);

    db.query(sql.search_list + order, [keyword], function (error, results, fields) {
        if (error) {
            console.error(error);
            return response.status(500).json({ error: 'search_error' });
        }
        response.json(results);
    });
});

// 알림 목록 가져오기
router.get('/notice_get/:user', function (request, response, next) {
    const user_no = request.params.user
    db.query(sql.notice_get, [user_no], function (error, results, fields) {
        if (error) {
            console.error(error);
            return response.status(500).json({
                error: 'DB error'
            })
        }
        response.json(results);
    })
})

// 알림 확인하기
router.post('/notice_check', function (request, response, next) {
    const notice_no = request.body.notice_no;

    db.query(sql.notice_check, [notice_no], function (error, results, fields) {
        if (error) {
            console.error(error);
            return response.status(500).json({
                error: 'DB error'
            })
        }
        return response.status(200).json({
            message: 'complete'
        })
    })
})






// 로그인
router.post('/login', function (request, response) {
    const loginUser = request.body;

    db.query(sql.id_check, [loginUser.user_id], function (error, results, fields) {
        if (results.length <= 0) {
            return response.status(200).json({
                message: 'undefined_id'
            })
        }

        db.query(sql.login, [loginUser.user_id], function (error, results, fields) {

            const same = bcrypt.compareSync(loginUser.user_pw, results[0].user_pw);

            if (!same) {
                // 비밀번호 불일치
                return response.status(200).json({
                    message: 'incorrect_pw'
                })
            }
            // 비밀번호 일치
            db.query(sql.user_no_get, [loginUser.user_id], function (error, results, fields) {
                return response.status(200).json({
                    message: results[0].user_no
                })
            })
        })
    })
})

// ID 체크 
router.post('/id_check', function (request, response) {
    const user = request.body;

    db.query(sql.id_check, [user.user_id], function (error, results, fields) {
        if (results.length <= 0) {
            return response.status(200).json({
                message: 'available'
            });
        }
        return response.status(200).json({
            message: 'disavailable'
        })
    })
})

// 회원가입
router.post('/join', function (request, response) {
    const user = request.body;
    const encryptedPW = bcrypt.hashSync(user.user_pw, 10); // 비밀번호 암호화

    db.query(sql.id_check, [user.user_id], function (error, results, fields) {
        if (results.length <= 0) {
            db.query(sql.join, [user.user_id, encryptedPW], function (error, data) {
                if (error) {
                    return response.status(500).json({
                        message: 'DB_error'
                    })
                }
                return response.status(200).json({
                    message: 'join_complete'
                });
            })
        }
        else {
            return response.status(404).json({
                message: 'already_exist_id'
            })
        }
    })
})

// 프로필 등록 여부 체크 8-20
router.post('/profile_check', function (request, response) {
    const user_no = request.body.user_no;

    db.query(sql.profile_check, [user_no], function (error, results, fields) {
        if (error) {
            return response.status(500).json({
                message: 'DB_error'
            })
        }
        if (results[0].user_tel == null){
            return response.status(200).json({
                message: 'none'
            })
        }
        return response.status(200).json({
            message: 'exist'
        })
    })
})



// 유저 소셜/로컬 확인
router.get('/user_social_tp/:user_no', (req, res) => {
    const user_no = req.params.user_no
    db.query(sql.user_social_tp, [user_no], (error, results, fields) => {
        if (error) {
            console.error(error);
            return response.status(500).json({ error: 'DB error' });
        }
        res.json(results);
    })
})

// pw 체크 230813 및 유저 삭제
router.post('/pw_check/:user_no', function (request, response) {
    const user_no = request.params.user_no;
    const { user_pw } = request.body;

    db.query(sql.pw_check, [user_no], async function (error, results, fields) {
        const same = bcrypt.compareSync(user_pw, results[0].user_pw);
        if (same) {
            db.query(sql.delete_user_bb, [user_no], function (error, results, fields) {
                if (error) {
                    console.error(error);
                    return response.status(500).json({
                        error: 'DB error'
                    })
                }
                return response.status(200).json({
                    message: '회원탈퇴'
                })
            })
        } else {
            return response.status(200).json({
                message: '비번불일치'
            })
        }
    });
});

// 유저 삭제
router.post('/delete_user_bb/:user_no', function (request, response, next) {
    const user_no = request.params.user_no;
    db.query(sql.delete_user_bb, [user_no], function (error, results, fields) {
        if (error) {
            console.error(error);
            return response.status(500).json({
                error: 'DB error'
            })
        }
        return response.status(200).json({
            message: '회원탈퇴'
        })
    })
})


//find페이지 관련
const { sendAuthCode, storedAuthCodes } = require('../send1');

router.post('/sendAuthCode', (req, res) => {
    try {
        const resultCode = sendAuthCode(req.body.user_phone_number); // send1.js 로직을 여기서 호출합니다.
        res.status(resultCode).send({ message: '인증번호가 성공적으로 전송되었습니다.' });
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: '인증번호 전송 중 오류가 발생했습니다.' });
    }
});

// 아무튼 비밀번호 재설정???
router.post('/verifyAuthCode', (req, res) => {
    const { user_phone_number, entered_auth_code } = req.body;

    if (storedAuthCodes[user_phone_number] === entered_auth_code) {

        const newTempPassword = Math.random().toString(36).slice(2);

        const hashedTempPassword = bcrypt.hashSync(newTempPassword, 5);

        const query = "UPDATE tb_user SET user_pw = ? WHERE user_tel = ?";
        db.query(query, [hashedTempPassword, user_phone_number], (err, result) => {
            if (err) {
                console.error(err);
                res.status(500).send({ message: "비밀번호 재설정 중 오류가 발생했습니다." });
            } else {
                res.status(200).send({ message: "비밀번호가 재설정되었습니다.", newPassword: newTempPassword });
            }
        });
    } else {
        res.status(400).send({ message: "인증번호가 일치하지 않습니다." });
    }
});

// 비밀번호 재설정
router.post("/resetPassword", (req, res) => {
    const { user_phone_number, new_password } = req.body;
    const query = "UPDATE tb_user SET user_pw = ? WHERE user_tel = ?";
    db.query(query, [new_password, user_phone_number], (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).send({ message: "비밀번호 재설정 중 오류가 발생했습니다." });
        } else {
            res.status(200).send({ message: "비밀번호가 재설정되었습니다." });
        }
    });
});

// 아이디 찾기
router.post('/findIdss', function (request, response, next) {
    const user_tel = request.body.user_tel;

    db.query(sql.id_find, [user_tel], function (error, results, fields) {
        if (error) {
            console.error(error);
            return response.status(500).json({ error: '회원 에러' });
        }
        if (results.length === 0) {

            return response.status(404).json({ message: 'user_not_found' });
        }
        const user_id = results[0].user_id;
        return response.status(200).json({
            message: 'user_tel',
            user_id: user_id
        });
    });
});

// 비밀번호 변경
router.post('/pass_process/:user_no', function (request, response) {
    const user_no = request.params.user_no;
    const pass = request.body;
    const encryptedPW = bcrypt.hashSync(pass.user_npw, 10); // 비밀번호 암호화

    db.query(sql.pw_check1, [user_no], (error, results, fields) => {
        const same = bcrypt.compareSync(pass.user_pw, results[0].user_pw);
        if (same) {

            db.query(sql.pass_update, [encryptedPW, user_no], function (error, results, fields) {
                if (error) {

                    return response.status(500).json({
                        message: 'DB_error'
                    });
                }

                return response.status(200).json({
                    message: 'pass_update'
                });
            });
        } else {
            return response.status(200).json({
                message: 'pw_ck'
            });
        }
    })
});




// 좋아요 불러오기
router.get('/like_list/:user_no', function (request, response, next) {
    const user_no = request.params.user_no;

    db.query(sql.like_list, [user_no], function (error, results, fields) {
        if (error) {
            console.error(error);
            return response.status(500).json({ error: 'error' });
        }
        response.json(results);
    });
});

// 네이버 로그인
router.post('/naverlogin', function (request, response) {
    const naverlogin = request.body.naverlogin;

    db.query(sql.naver_id_check, [naverlogin.id], function (error, results, fields) {
        if (error) {
            console.log(error);
            return response.status(500).json({
                message: 'DB_error'
            });
        }
        if (results.length > 0) {
            // 가입된 계정 존재 
            db.query(sql.user_no_get, [naverlogin.id], function (error, results, fields) {
                if (error) {
                    console.log(error)
                }
                return response.status(200).json({
                    message: results[0].user_no
                })
            })
        } else {
            // DB에 계정 정보 입력 
            db.query(sql.naverlogin, [naverlogin.id, naverlogin.nickname], function (error, result) {
                if (error) {
                    console.error(error);
                    return response.status(500).json({ error: 'error' });
                }

                db.query(sql.user_no_get, [naverlogin.id], function (error, results, fields) {
                    if (error) {
                        console.log(error)
                    }
                    return response.status(200).json({
                        message: results[0].user_no
                    })
                })

            })

        }
    })
})

// 카카오 로그인
router.post('/kakaoLoginProcess', function (request, response) {
    const kakao = request.body;
    console.log(kakao);

    db.query(sql.kakao_check, [kakao.user_id], function (error, results, fields) {
        if (results.length <= 0) {
            db.query(sql.kakaoJoin, [kakao.user_id, kakao.user_nick, kakao.user_id], function (error, result) {
                if (error) {
                    console.error(error);
                    return response.status(500).json({ error: 'error' });
                }
                db.query(sql.user_no_get, [kakao.user_id], function (error, results, fields) {
                    if (error) {
                        console.log(error)
                    }
                    return response.status(200).json({
                        message: results[0].user_no
                    })
                })
            })
        }
        else {
            db.query(sql.user_no_get, [kakao.user_id], function (error, results, fields) {
                if (error) {
                    console.log(error)
                }
                return response.status(200).json({
                    message: results[0].user_no
                })
            })
        }
    })
})





//카테고리 가져오기
router.post('/category', function (request, response, next) {

    db.query(sql.get_category, function (error, result, fields) {
        if (error) {
            console.error(error);
            return response.status(500).json({
                error: 'mypage_update_error'
            });
        }
        // console.log(result)
        return response.status(200).json(result);
    });
});

//취미 저장
router.post('/setting_hobby', function (request, response, next) {
    const user = request.body.user_hobby;
    const user_no = request.body.user_no;

    // 유저의 hobby값 유뮤 체크
    db.query(sql.check_hobby, [user_no], function (error, results, fields) {
        //값 없으면->바로저장
        if (results.length <= 0) {
            user.forEach((a, i) => {
                db.query(sql.hobby_update, [user_no, user[i]], function (error, result, fields) {
                    if (error) {
                        console.error(error);
                        return response.status(500).json({
                            error: 'mypage_update_error'
                        });
                    }
                });
            })
        } else {
            // 값있으면-> 전체삭제후-> 저장
            db.query(sql.delete_hobby, [user_no], function (error, result, fields) {
                user.forEach((a, i) => {
                    db.query(sql.hobby_update, [user_no, user[i]], function (error, result, fields) {
                        if (error) {
                            console.error(error)
                            return response.status(500).json({
                                error: 'mypage_update_error'
                            });
                        }
                    });
                })
            })
        }
        return response.status(200).json({ message: 'hobby_update' });
    })
});

//취미 가져오기
router.get('/user_hobby/:user', function (request, response, next) {
    const user_no = request.params.user;

    db.query(sql.get_user_hobby, [user_no], function (error, results, fields) {
        if (error) {
            console.error(error);
            return response.status(500).json({ error: '회원에러' });
        }
        // results.forEach((a,i)=>{
        // console.log(results)
        return response.status(200).json(results);
        // })
    });
});

// 취미 번호로 가져오기
router.get('/user_hobby_no/:user', function (request, response, next) {
    const user_no = request.params.user;

    db.query(sql.user_hobby_no, [user_no], function (error, results, fields) {
        if (error) {
            console.error(error);
            return response.status(500).json({ error: '회원에러' });
        }
        return response.status(200).json(results);
    });
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

//지역구 저장
router.post('/setting_zone', function (request, response, next) {
    const user_no = request.body.user_no;
    const user_zone = request.body.user_zone;


    db.query(sql.zone_update, [user_zone[0], user_zone[1], user_no], function (error, result, fields) {
        if (error) {
            console.error(error);
            return response.status(500).json({
                error: 'mypage_update_error'
            });
        }

        console.log('성공')
    })

})

//유저 지역구 불러오기
router.get('/user_zone/:user', function (request, response, next) {
    const user_no = request.params.user;

    db.query(sql.get_user_zone, [user_no], function (error, results, fields) {
        if (error) {
            console.error(error);
            return response.status(500).json({ error: '회원에러' });
        }

        // console.log(results)
        return response.status(200).json(results);

    });
});



// 정보 수정
router.post('/setting', function (request, response, next) {

    let user = request.body;

    let user_img = user.user_img
    console.log(user)

    if (user.user_birth.length == 0) {
        user.user_birth = null;
    }

    if (user.tmp_img != '') {
        const filename = user.user_no;
        const pastDir = `${__dirname}` + `/../uploads/` + user.tmp_img;
        const newDir = `${__dirname}` + `/../uploads/uploadProfile/`;
        const extension = user.tmp_img.substring(user.tmp_img.lastIndexOf('.'));

        fs.rename(pastDir, newDir + filename + extension, (err) => {
            if (err) {
                console.error(err);
            }
            else {
                user_img = filename + extension;

                db.query(sql.setting_update, [user.user_nick, user.user_tel, user.user_gender, user_img, user.user_birth, user.user_no], function (error, result, fields) {
                    if (error) {
                        console.error(error);
                        return response.status(500).json({
                            error: 'mypage_update_error'
                        });
                    }

                    return response.status(200).json({
                        message: 'mypage_update'
                    });
                });
            }
        });
    }
    else {
        db.query(sql.setting_update, [user.user_nick, user.user_tel, user.user_gender, user_img, user.user_birth, user.user_no], function (error, result, fields) {
            if (error) {
                console.error(error);
                return response.status(500).json({
                    error: 'mypage_update_error'
                });
            }

            return response.status(200).json({
                message: 'mypage_update'
            });
        });
    }

});

// 유저 정보 가져오기
router.get('/user_info/:user', function (request, response, next) {
    const user_no = request.params.user;
    db.query(sql.get_user_info, [user_no], function (error, results, fields) {
        if (error) {
            console.error(error);
            return response.status(500).json({
                error: '회원에러'
            });
        }
        // console.log(results)
        response.json(results);
    });
});

// mbti 등록
router.post('/mbti', function (request, response) {
    const data = request.body;
    console.log(data)

    db.query(sql.mbti, [data.user_mbti, data.user_no], function (error, results, fields) {
        if (error) {
            console.error(error);
            return response.status(500).json({
                error: 'DB error'
            });
        }
        return response.status(200).json({
            message: 'success'
        })
    })
})

// mbti 모임추천하기 - 해당 카테고리의 인증뱃지수
router.get('/mbti_suggest/:cate', function (request, response, next) {
    const category_no = request.params.cate;
    db.query(sql.mbti_suggest, [category_no], function (error, results, fields) {
        if (error) {
            console.error(error);
            return response.status(500).json({
                error: '디비에러'
            });
        }
        response.json(results[0]);
    });
});



// 자주 묻는 질문 가져오기
router.get('/faq', function (request, response) {
    const qna_no = request.params.qna_no;
    db.query(sql.faq, [qna_no], function (error, results) {
        if (error) {
            console.error(error);
            return response.status(500).json({
                error: 'DB error'
            });
        }
        return response.status(200).json(results);
    });
});


// 방장 체크 boss_check
router.post('/boss_check', function (request, response) {
    const moim_no = request.body.moim_no;

    db.query(sql.boss_check, [moim_no], function (error, results, fields) {

        if (error) {
            console.error(error);
        }

        return response.status(200).json({
            message: results[0].user_no
        })

    })
})

module.exports = router;