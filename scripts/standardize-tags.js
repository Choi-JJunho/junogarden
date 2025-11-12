const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const blogDir = path.join(process.cwd(), 'content/blog');

// 태그 표준화 맵핑
const tagMapping = {
  // 기술 스택 통일
  'Springboot': 'Spring Boot',
  'springboot': 'Spring Boot',
  'Spring boot': 'Spring Boot',
  'Spring': 'Spring',
  'SpringSecurity': 'Spring Security',
  'JPA': 'JPA',
  'JUnit5': 'JUnit5',

  // Java 관련
  'Java': 'Java',
  'java': 'Java',

  // 테스트 관련
  'test': '테스트',
  'unittest': '테스트',
  'TDD': 'TDD',
  'JDBCTest': '테스트',
  'TestContainer': 'TestContainer',
  '인수테스트': '테스트',

  // 우아한테크코스
  '우아한테크코스': '우아한테크코스',
  '우테코': '우아한테크코스',
  '5기': '우아한테크코스',
  '레벨1': '우아한테크코스 레벨1',
  '레벨2': '우아한테크코스 레벨2',
  '레벨3': '우아한테크코스 레벨3',
  '레벨4': '우아한테크코스 레벨4',
  '레벨5': '우아한테크코스 레벨5',
  '미션': '우아한테크코스',
  '프리코스': '우아한테크코스 프리코스',
  '피움': '피움',

  // 백엔드
  '백엔드': '백엔드',
  '백앤드': '백엔드',

  // BCSDLab / KOIN
  'BCSDLab': 'BCSDLab',
  'Koin': 'KOIN',
  'KOIN': 'KOIN',
  '마이그레이션': '마이그레이션',

  // NEXTERS
  'NEXTERS': 'NEXTERS',
  '넥스터즈': 'NEXTERS',
  '25기': 'NEXTERS',
  '뽀모냥': 'NEXTERS',

  // 회고
  '회고': '회고',
  '후기': '회고',

  // 글또
  '글또': '글또',
  '9기': '글또',

  // 초록스터디
  '초록 스터디': '초록스터디',
  '초록스터디': '초록스터디',
  '슬개생': '초록스터디',
  '슬기로운개발생활': '초록스터디',
  '원티드': '초록스터디',

  // 성능
  '성능테스트': '성능 테스트',
  '성능개선': '성능 최적화',
  'nGrinder': '성능 테스트',
  'Jmeter': '성능 테스트',
  'K6': '성능 테스트',
  'gatling': '성능 테스트',

  // AWS
  'aws': 'AWS',
  'ec2': 'AWS',
  'S3': 'AWS',
  's3': 'AWS',
  'cloudfront': 'AWS',

  // 인증/보안
  'JWT': 'JWT',
  'SpringSecurity': 'Spring Security',
  'refresh-token': 'JWT',

  // 데이터베이스
  'Database': '데이터베이스',
  'DB 초기화': '데이터베이스',
  'redis': 'Redis',
  'Redis': 'Redis',
  'Hibernate': 'JPA',

  // 문서화
  'RestDocs': 'Spring REST Docs',
  '문서화': '문서화',
  'JAVADOC': 'JavaDoc',
  'Swagger': 'Swagger',
  'API First': 'API 설계',

  // Git
  'git': 'Git',
  'github': 'GitHub',
  'github action': 'GitHub Actions',
  'commit.template': 'Git',
  'convention': 'Git',
  'submodule': 'Git',
  'Co-authored-by': 'Git',

  // CI/CD
  'jenkins': 'Jenkins',

  // 아키텍처/설계
  'cleancode': '클린 코드',
  '깨끗한 코드': '클린 코드',
  'ArchUnit': '아키텍처',
  'Event': '이벤트 기반',
  'RPC': '아키텍처',
  '이벤트 스토밍': '이벤트 스토밍',

  // 기타 기술
  'docker': 'Docker',
  'kubernetes': 'Kubernetes',
  'vue': 'Vue.js',
  'html': 'HTML',
  'webtrc': 'WebRTC',
  'Markdown': 'Markdown',
  'mermaid': 'Mermaid',
  'Solr': 'Solr',
  '검색엔진': '검색',

  // 개념
  '다형성': '객체지향',
  '객체지향': '객체지향',
  '함수형 인터페이스': '함수형 프로그래밍',
  '동시성': '동시성',
  '멀티스레딩': '동시성',
  'transactional': '트랜잭션',
  'readonly': '트랜잭션',
  'final': 'Java',
  '불변': 'Java',

  // 도구
  'postman': 'Postman',
  'gradle': 'Gradle',
  'tomcat': 'Tomcat',

  // 네트워크
  '네트워크': '네트워크',
  'cors': 'CORS',
  'SMTP': '네트워크',
  'IMAP': '네트워크',
  'POP3': '네트워크',

  // 알고리즘
  '알고리즘': '알고리즘',
  '백준': '알고리즘',

  // 연도
  '2021': '2021',
  '2022년': '2022',
  '2023년': '2023',
  '2024년': '2024',
  '1월': '월간회고',
  '2월': '월간회고',
  '3월': '월간회고',
  '4월': '월간회고',
  '5월': '월간회고',
  '6월': '월간회고',
  '7월': '월간회고',

  // 기타
  '해커톤': '해커톤',
  '교육': '교육',
  '협업': '협업',
  '기획': '기획',
  'udemy': 'Udemy',
  '디스코드': 'Discord',
  '봇': 'Discord',
  '책': '독서',
  '리눅스': 'Linux',
  '메모리': 'Linux',
  'swap': 'Linux',
  '개행': '코드 컨벤션',
  'POSIX': '코드 컨벤션',
  'CRLF': '코드 컨벤션',
  '마지막줄': '코드 컨벤션',
};

// 카테고리별 대표 태그 추가
const categoryTags = {
  spring: ['Spring Boot', 'Spring', 'Spring Security', 'Spring REST Docs', 'JPA'],
  testing: ['테스트', 'TDD', 'JUnit5', 'TestContainer'],
  backend: ['백엔드', 'Java', 'API 설계'],
  database: ['데이터베이스', 'Redis', 'JPA'],
  devops: ['AWS', 'Docker', 'Kubernetes', 'Jenkins', 'GitHub Actions'],
  architecture: ['아키텍처', '클린 코드', '객체지향', '이벤트 기반'],
  performance: ['성능 테스트', '성능 최적화'],
  documentation: ['문서화', 'JavaDoc', 'Swagger', 'Spring REST Docs'],
};

function standardizeTags(tags) {
  if (!Array.isArray(tags)) return [];

  const standardized = new Set();

  tags.forEach(tag => {
    const mapped = tagMapping[tag] || tag;
    if (mapped && mapped.trim()) {
      standardized.add(mapped);
    }
  });

  return Array.from(standardized).sort();
}

function processFiles() {
  const files = fs.readdirSync(blogDir).filter(f => f.endsWith('.md'));
  let updatedCount = 0;

  files.forEach(filename => {
    const filePath = path.join(blogDir, filename);
    const content = fs.readFileSync(filePath, 'utf8');

    try {
      const { data, content: markdown } = matter(content);

      if (data.tags && Array.isArray(data.tags) && data.tags.length > 0) {
        const originalTags = [...data.tags];
        const standardizedTags = standardizeTags(data.tags);

        // 태그가 변경된 경우에만 업데이트
        if (JSON.stringify(originalTags) !== JSON.stringify(standardizedTags)) {
          data.tags = standardizedTags;

          const newContent = matter.stringify(markdown, data);
          fs.writeFileSync(filePath, newContent, 'utf8');

          console.log(`✓ Updated: ${filename}`);
          console.log(`  Before: ${originalTags.join(', ')}`);
          console.log(`  After:  ${standardizedTags.join(', ')}`);
          updatedCount++;
        }
      }
    } catch (error) {
      console.error(`✗ Error processing ${filename}:`, error.message);
    }
  });

  console.log(`\n${updatedCount}/${files.length} files updated`);
}

processFiles();
