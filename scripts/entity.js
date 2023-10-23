class Entity {
    constructor(
        pos = createVector(random(width), random(height)),
        col = color(255),
        velocity = createVector(random(-1, 1), random(-1, 1)),
        maxSpeed = 6,
        maxForce = 0.05,
        avoidRadius = 100,
        avoidWallsRadius = 100,
        separation = 30,
        alignmentRadius = 400,
        cohesionRadius = 400,
    ) {
        this.pos = createVector(pos.x, pos.y);
        this.col = col;
        this.acceleration = createVector(0, 0);
        this.velocity = velocity;
        this.maxSpeed = maxSpeed;
        this.maxForce = maxForce;
        this.avoidRadius = avoidRadius;
        this.avoidWallsRadius = avoidWallsRadius;
        this.separation = separation;
        this.alignmentRadius = alignmentRadius;
        this.cohesionRadius = cohesionRadius;
        this.size = 7;
    }

    update(entities) {
        if (this.pos.x > width) {
            this.pos.x = width;
            this.velocity.x *= -1;
        } else if (this.pos.x < 0) {
            this.pos.x = 0;
            this.velocity.x *= -1;
        }
        if (this.pos.y > height) {
            this.pos.y = height;
            this.velocity.y *= -1;
        } else if (this.pos.y < 0) {
            this.pos.y = 0;
            this.velocity.y *= -1;
        }

        this.flock(entities);

        this.velocity.add(this.acceleration);
        this.velocity.limit(this.maxSpeed);
        this.pos.add(this.velocity);
        this.acceleration.mult(0);
    }

    draw() {
        push();
        translate(this.pos.x, this.pos.y);
        rotate(this.velocity.heading());
        fill(this.col)
        ellipse(0, 0, this.size)
        pop();
    }

    flock(entities) {
        let avoidForce = this.avoid(createVector(mouseX, mouseY));
        let avoidWallsForce = this.avoidWalls();
        let alignForce = this.align(entities);
        let separateForce = this.separate(entities);
        let cohesionForce = this.cohesion(entities);

        alignForce.mult(0.7)
        separateForce.mult(2)
        avoidWallsForce.mult(2)
        avoidForce.mult(2)

        this.steer(avoidForce);
        this.steer(avoidWallsForce);
        this.steer(separateForce);
        this.steer(alignForce);
        this.steer(cohesionForce);
    }

    steer(force) {
        this.acceleration.add(force);
    }

    steerTowards(target) {
        let desired = p5.Vector.sub(target, this.pos);
        desired.normalize();
        desired.mult(this.maxSpeed);
        let steer = p5.Vector.sub(desired, this.velocity);
        steer.limit(this.maxForce);
        return steer;

    }

    avoid(target) {
        if (Math.abs(this.pos.x - target.x) > this.avoidRadius || Math.abs(this.pos.y - target.y) > this.avoidRadius) return createVector(0, 0);
        if (p5.Vector.dist(this.pos, target) < this.avoidRadius) {
            let desired = p5.Vector.sub(target, this.pos).mult(-1);
            let d = desired.mag();
            desired.normalize();
            desired.mult(this.maxSpeed);
            let steer = p5.Vector.sub(desired, this.velocity);
            steer.limit(this.maxForce);
            return steer;
        } else {
            return createVector(0, 0);
        }
    }

    avoidWalls() {
        let desired = null;

        if (this.pos.x < this.avoidWallsRadius) {
            desired = createVector(this.maxSpeed, this.velocity.y);
        } else if (this.pos.x > width - this.avoidWallsRadius) {
            desired = createVector(-this.maxSpeed, this.velocity.y);
        }

        if (this.pos.y < this.avoidWallsRadius) {
            desired = createVector(this.velocity.x, this.maxSpeed);
        } else if (this.pos.y > height - this.avoidWallsRadius) {
            desired = createVector(this.velocity.x, -this.maxSpeed);
        }

        if (desired !== null) {
            desired.normalize();
            desired.mult(this.maxSpeed);
            let steer = p5.Vector.sub(desired, this.velocity);
            steer.limit(this.maxForce);
            return steer;
        } else {
            return createVector(0, 0);
        }
    }

    separate(entities) {
        let steer = createVector(0, 0);
        let count = 0;

        entities.forEach(entity => {
            if (this == entity) return;
            if (Math.abs(this.pos.x - entity.pos.x) > this.separation || Math.abs(this.pos.y - entity.pos.y) > this.separation) return;
            let d = p5.Vector.dist(this.pos, entity.pos);
            if (entity != this && (d > 0) && (d < this.separation)) {
                let diff = p5.Vector.sub(this.pos, entity.pos);
                diff.normalize();
                diff.div(d);
                steer.add(diff);
                count++;
            }
        });

        if (count > 0) {
            steer.div(count);
        }

        if (steer.mag() > 0) {
            steer.normalize();
            steer.mult(this.maxSpeed);
            steer.sub(this.velocity);
            steer.limit(this.maxForce);
        }
        return steer;
    }

    align(entities) {
        let sum = createVector(0, 0);
        let count = 0;
        entities.forEach(entity => {
            if (this == entity) return;
            let d = dist(this.pos.x, this.pos.y, entity.pos.x, entity.pos.y);
            if (entity != this && d < this.alignmentRadius) {
                sum.add(entity.velocity);
                count++;
            }
        });
        if (count > 0) {
            sum.div(count);
            sum.normalize();
            sum.mult(this.maxSpeed);
            let steer = p5.Vector.sub(sum, this.velocity);
            steer.limit(this.maxForce);
            return steer;
        } else {
            return createVector(0, 0);
        }
    }

    cohesion(entities) {
        let sum = createVector(0, 0);
        let count = 0;
        entities.forEach(entity => {
            if (this == entity) return;
            let d = p5.Vector.dist(this.pos, entity.pos);
            if ((d > 0) && (d < this.cohesionRadius)) {
                sum.add(entity.pos);
                count++;
            }
        });
        if (count > 0) {
            sum.div(count);
            return this.steerTowards(sum);
        } else {
            return createVector(0, 0);
        }
    }
}