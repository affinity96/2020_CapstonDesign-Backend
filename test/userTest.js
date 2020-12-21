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

    var data ="G6GPHjfdoQQ6lCpdVcNv0l4ryeD3";
    var wrong_data ="G6GPHjfdoQQ6lCpdVcNv0l4r";

    describe("유저 정보 불러오기 ->", function(){
        it("불러오기 성공", function (done) {

            request(svr)
                .get("/user/?userId=" +data)
                .end(function (err, res) {
                    if (err) return done(err);
                    done();
                });
        });

        it("불러오기 싷패", function (done) {

            request(svr)
                .get("/user/?userId=" +wrong_data)
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