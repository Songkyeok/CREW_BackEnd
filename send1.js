let storedAuthCodes = {}; // 메모리에 인증번호를 저장할 객체

function sendAuthCode(user_phone_number) {
var CryptoJS = require("crypto-js");
var SHA256 = require("crypto-js/sha256");
var Base64 = require("crypto-js/enc-base64");
const axios = require("axios");
  var user_phone_number = user_phone_number;
  var user_id = user_id;
  var user_auth_number =  Math.random().toString(36).slice(2);//0816 숫자 수
  var resultCode = 404;

  const date = Date.now().toString();
  const uri = "ncp:sms:kr:312882776785:themoim";
  const secretKey = "0LFvdGwzNuAnXWCbh3YjH4H8DQJj7NwB0Vkv9GOb";
  const accessKey = "Ijx61Rjs1MkMDvutLYhp";
  const method = "POST";
  const space = " ";
  const newLine = "\n";
  const url = `https://sens.apigw.ntruss.com/sms/v2/services/${uri}/messages`;
  const url2 = `/sms/v2/services/${uri}/messages`;

  const hmac = CryptoJS.algo.HMAC.create(CryptoJS.algo.SHA256, secretKey);

  hmac.update(method);
  hmac.update(space);
  hmac.update(url2);
  hmac.update(newLine);
  hmac.update(date);
  hmac.update(newLine);
  hmac.update(accessKey);

  const hash = hmac.finalize();
  const signature = hash.toString(CryptoJS.enc.Base64);
  // const user_auth_number = Math.random().toString(36).slice(2);


  axios(
    {
      method: method,
      json: true,
      url: url,
      headers: {
        "Content-type": "application/json; charset=utf-8",
        "x-ncp-iam-access-key": accessKey,
        "x-ncp-apigw-timestamp": date,
        "x-ncp-apigw-signature-v2": signature,
      },
      data: { 
        type: "SMS",
        countryCode: "82",
        from: "01077653948",
        content: `인증번호 ${user_auth_number} 입니다.`,
        messages: [

               {to: `${user_phone_number}`},
          ],
      },
    }).then((res) => {
      console.log("성공");
      // 인증번호를 저장
      storedAuthCodes[user_phone_number] = user_auth_number;
    }).catch((err) => {
      console.log(err);      

      throw new Error("인증번호 전송 중 오류가 발생했습니다.");
    });
  return resultCode;
  }
// module.exports = sendAuthCode;
module.exports = {
  sendAuthCode,
  storedAuthCodes, // 메모리에 저장된 인증번호 객체를 내보냅니다.
};