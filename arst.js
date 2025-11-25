import semver from 'semver';

console.log(semver.intersects('>=0.8.0 <0.9.0;', '0.8.2'));
