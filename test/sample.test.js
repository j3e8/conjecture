process.env.NODE_ENV = 'test';

const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../index');
const { pool } = require('../lib/database');
const should = chai.should();

chai.use(chaiHttp);

describe('Samples', () => {
  const sample = {
    name: 'Test',
  };
  const sampleUpdate = {
    name: 'Test 2',
  };

  before(() => {
    return pool.query('DELETE FROM sample');
  });

  describe('/POST /api/sample', () => {
    it('should create a sample and return it', () => {
      return chai.request(server)
        .post('/api/sample')
        .send(sample)
        .then((res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('name');
          res.body.name.should.equal(sample.name);
          res.body.should.have.property('id');
          sample.id = res.body.id;
        });
    });
  });

  describe('/GET /api/sample/:sampleId', () => {
    it('should get a sample', () => {
      return chai.request(server)
        .get(`/api/sample/${sample.id}`)
        .then((res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('name');
          res.body.name.should.equal(sample.name);
          res.body.should.have.property('id');
          res.body.id.should.equal(sample.id);
        });
    });
  });

  describe('/GET /api/sample', () => {
    it('should get a list of all samples in the database', () => {
      return chai.request(server)
        .get('/api/sample')
        .then((res) => {
          res.should.have.status(200);
          res.body.should.be.an('array').that.deep.includes(sample);
        });
    });
  });

  describe('/PUT /api/sample/:sampleId', () => {
    it('should update a sample in the database', () => {
      return chai.request(server)
        .put(`/api/sample/${sample.id}`)
        .send(sampleUpdate)
        .then((res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('name');
          res.body.name.should.equal(sampleUpdate.name);
        });
    });
  });

  describe('/DELETE /api/sample/:sampleId', () => {
    it('should delete a sample in the database', () => {
      return chai.request(server)
        .delete(`/api/sample/${sample.id}`)
        .then((res) => {
          res.should.have.status(200);
          res.body.should.be.empty;
        });
    });
  });

  describe('/GET /api/sample/:sampleId after deletion', () => {
    it('should not get a sample because it was deleted', () => {
      return chai.request(server)
        .get(`/api/sample/${sample.id}`)
        .then((res) => {
          res.should.have.status(200);
          res.body.should.be.empty;
        });
    });
  });

  after(() => {
    server.close();
  });
});
