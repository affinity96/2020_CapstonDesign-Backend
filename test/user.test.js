var assert = require("assert");
var should = require('should');
var mocha = require('mocha');
var request = require("supertest");
var expect = require("chai").expect;
var server = require("../app.js");

describe("유저 데이터 테스트 ->", function () {
    var svr = "http://localhost:3000";

    var id = 'xkfYvelu3HWwDyEw2msAstJZ05g2';

    describe("유저 정보 불러오기 ->", function () {
        it("불러오기 성공", function (done) {

            request(svr)
                .get("/user/?userId="+id)
                .end(function (err, res) {
                    if (err) return done(err);
                    done();
                });
        });
    })

    after(function () {
        // server.close();
    });

    describe("회원가입 여부 테스트 ->", function () {
        var user_data={
            userEmail: 'phm3355@ajou.ac.kr',
            userPhone: '01068203922',
            userId: '2',
            userName: '박현민',
            userBirth: '1996-05-17',
            userGender: 1,
        }
        var wrong_user_data={
        }

        it("회원가입 성공", function (done) {

            request(svr)
                .post("/user/add")
                .send(user_data)
                .expect('{"code":200,"message":"회원가입 성공"}')
                .set('Accept', 'application/json')
                .end(function (err, res) {
                    if (err) return done(err);

                    done();
                });
        });

        it("회원가입 실패", function (done) {

            request(svr)
                .post("/user/add")
                .send(wrong_user_data)
                .expect('{"code":404,"message":"에러 발생"}')
                .end(function (err, res) {
                    if (err) return done(err);
                    done();
                });
        });

        after(function () {
            // server.close();
        });
    })

    describe("회원탈퇴 여부 테스트 ->", function () {
        var userId = '2';

        it("회원탈퇴 성공", function (done) {

            request(svr)
                .put("/user/delete/?userId="+userId)
                .expect('{"code":200,"message":"회원 탈퇴 성공"}')
                .set('Accept', 'application/json')
                .end(function (err, res) {
                    if (err) return done(err);

                    done();
                });
        });

        after(function () {
            // server.close();
        });
    })
});