var assert = require("assert");
var should = require('should');
var mocha = require('mocha');
var request = require("supertest");
var expect = require("chai").expect;
var server = require("../app.js");

describe("유저 데이터 테스트 ->", function () {
    var svr = "http://localhost:3000";

    var data ="G6GPHjfdoQQ6lCpdVcNv0l4ryeD3";
    var wrong_data ="G6GPHjfdoQQ6lCpdVcNv0l4r";
    var name = "";
    var group_id ="";
    var email = "";
    var phone = "";
    var gender;

    describe("유저 정보 불러오기 ->", function(){
        it("불러오기 성공", function (done) {

            request(svr)
                .get("/user/?userId=" +data)
                .end(function (err, res) {
                    if (err) return done(err);
                    done();
                });
        });

        it("불러오기 실패", function (done) {

            request(svr)
                .get("/user/?userId="+wrong_data)
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

    describe("유저 정보 받기", function(){
        it("유저 정보", function(done){
            request(svr)
            .get("/user/?userId=" +data)
            .end(function (err, res) {
                if (err) return  done(err);
                // console.log(res.body);
                name = res.body.name;
                group_id = res.body.group_id;
                email = res.body.email;
                gender = res.body.gender;
                phone = res.body.phone;
                done();

            });
        });

        it("유저 이름",function(){
            assert.equal(name,"창이창이");
        });

        it("유저 그룹", function(){
            assert.equal(group_id, "85");
        });

        it("유저 email", function(){
            assert.equal(email, "affinity966@gmail.com");
        });

        it("유저 id", function(){
            assert.equal(gender, 1);
        });

        it("유저 phone", function(){
            assert.equal(phone, "+8201020830748");
        });


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
        var wrong_userId = '3';

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
        it("회원탈퇴 실패", function (done) {

            request(svr)
                .put("/user/delete/?userId="+wrong_userId)
                .expect('{"code":404,"message":"회원 탈퇴 에러 발생"}')
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