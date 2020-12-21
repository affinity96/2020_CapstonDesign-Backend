var assert = require("assert");
var should = require('should');
var mocha = require('mocha');
var request = require("supertest");
var expect = require("chai").expect;
var server = require("../app.js");

describe("그룹 데이터 테스트 ->", function () {
    var svr = "http://localhost:3000";

    var group_id ="62";
    var wrong_group_id ="1000";

    describe("그룹 정보 불러오기 ->", function(){
        it("불러오기 성공", function (done) {

            request(svr)
                .get("/pet/?groupId=" +group_id)
                .end(function (err, res) {
                    if (err) return done(err);
                    done();
                });
        });
        after(function () {
            // server.close();
        });


        it("불러오기 실패", function (done) {

            request(svr)
                .get("/pet/?groupId=" +wrong_group_id)
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

    describe("그룹 생성 여부 테스트 ->", function () {
        var group_data={
            userId: 'xkfYvelu3HWwDyEw2msAstJZ05g2',
            groupName: '테스트코드',
            area: '수원시 팔달구 우만동',
            groupIntroduction: '테스트',
            groupAddress: '(16497) 경기 수원시 팔달구 우만동 43-12',
        }
        var wrong_group_data={
        }

        it("그룹생성 성공", function (done) {

            request(svr)
                .post("/group/add")
                .send(group_data)
                .expect('{"code":200,"message":"그룹생성 성공"}')
                .set('Accept', 'application/json')
                .end(function (err, res) {
                    if (err) return done(err);

                    done();
                });
        });

        it("그룹생성 실패", function (done) {

            request(svr)
                .post("/group/add")
                .send(wrong_group_data)
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
});