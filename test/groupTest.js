var server = require("../app.js");
var assert = require("assert");
var should = require("should");
var mocha = require("mocha");
var request = require("supertest");
var expect = require("chai").expect;

const mysql = require("mysql");
const dbconfig = require("../config/database.js");
const db = mysql.createConnection(dbconfig);



describe('유저 정보 불러오기 테스트 ->', function(){
    var svr = "http://localhost:3000";
    // var sqlUserSelect = "SELECT * FROM homekippa.User WHERE name = ?";

    var group_id ="62";
    var wrong_group_id ="1000";

    describe("유저 정보 불러오기 ->", function(){
        it("불러오기 성공", function (done) {

            request(svr)
                .get("/pet/?groupId=" +group_id)
                .end(function (err, res) {
                    if (err) return done(err);
                    console.log(res.body);
                    done();
                });
        });
        after(function () {
            // server.close();
        });


        it("불러오기 실패", function (done) {

            request(svr)
                .get("/pet/?groupId=" +wrong_group_id)
                .end(function (err, res) {
                    if (err) return done(err);
                    console.log(res.body);
                    done();
                });
        });
        after(function () {
            // server.close();
        });


    })
});