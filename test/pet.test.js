var assert = require("assert");
var should = require('should');
var mocha = require('mocha');
var request = require("supertest");
var expect = require("chai").expect;
var server = require("../app.js");

describe("펫 데이터 테스트 ->", function () {
    var svr = "http://localhost:3000";

    describe("펫등록 여부 테스트 ->", function () {
        var pet_data={
            petGender: '수컷',
            petSpecies: '테스트',
            GroupId: '2',
            petName: '테스트',
            petBirth: '2020-12-01',
            petNeutralization: '중성',
        }
        var wrong_pet_data={
        }

        it("펫등록 성공", function (done) {

            request(svr)
                .post("/pet/add/des")
                .send(pet_data)
                .expect('{"code":200,"message":"펫생성 성공"}')
                .set('Accept', 'application/json')
                .end(function (err, res) {
                    if (err) return done(err);

                    done();
                });
        });

        it("펫등록 실패", function (done) {

            request(svr)
                .post("/pet/add/des")
                .send(wrong_pet_data)
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