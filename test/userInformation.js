var server = require("../app.js");
var assert = require("assert");
var should = require("should");
var mocha = require("mocha");
var request = require("supertest");
var expect = require("chai").expect;

const mysql = require("mysql");
const dbconfig = require("../config/database.js");
const { doesNotThrow } = require("should");
const db = mysql.createConnection(dbconfig);



describe('유저 정보 불러오기 테스트 ->', function(){
    var svr = "http://localhost:3000";
    // var sqlUserSelect = "SELECT * FROM homekippa.User WHERE name = ?";

    var data ="G6GPHjfdoQQ6lCpdVcNv0l4ryeD3";
    var name = "";
    var group_id ="";
    var email = "";
    var phone = "";
    var gender;
    describe("유저 정보 받기", function(){
        it("유저 정보", function(done){
            request(svr)
            .get("/user/?userId=" +data)
            .end(function (err, res) {
                if (err) return  done(err);
                console.log(res.body);
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







})