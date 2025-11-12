---
title: OpenAPI CodeGenerator 활용하기
description: OpenAPI Generator를 활용하여 코드를 손쉽게 관리해보자
date: 2023-10-26T02:42:31.037Z
tags:
  - Gradle
  - Spring Boot
  - codegenerator
  - openapi
---
# 서론

이전에 OpenAPI CodeGenerator에 대해 알아봤었다.

간단하게 설명하자면 CodeGenerator는 OpenAPI Spec을 기반으로 프로젝트 코드를 생성해주는 오픈소스 툴이다.

이번 글에서는 이 Code Generator를 활용하는 방안에 대해 구체적으로 이야기해보려고한다. 

- [📝 OpenAPI Generator 문서](https://openapi-generator.tech/)
- [🐙 OpenAPI Generator Github](https://github.com/OpenAPITools/openapi-generator)

> 💡 본 글은 백엔드 Spring 프로젝트를 기반으로 CodeGenerator 활용 방법을 설명하고있습니다.
> OpenAPI Spec에 대한 자세한 내용은 이전 글 [API First란?](https://velog.io/@junho5336/API-First%EB%9E%80)을 확인해주세요

# 문제인식

기존 CodeGenerator가 OpenAPI Spec을 기반으로 프로젝트를 생성해주는 것 까지는 신기하고 좋았다.

하지만 이를 어떻게 활용할지는 잘 모르겠다. 프로젝트의 설정파일부터 구현 코드까지 모두 작성한다면 해당 프로젝트는 CodeGenerator에 매우 의존적이게 된다.

생성해주는 코드 중 적절하게 사용할 만한 부분만 사용할 수는 없을까? 🤔

이를 해결하기 위해 CodeGenerator에서 제공하는 Gradle Plugin을 활용해볼 수 있다.

# Gradle Plugin

OpenAPI Generator는 Maven, Gradle 플러그인을 제공하고있다.

여기서는 Gradle 플러그인을 활용하여 Code Generator를 편리하게 사용해보려고한다.

> 해당 섹션은 Gradle Plugin이 어떻게 구성되어있는지 확인하기 위한 파트입니다.
> 직접 프로젝트에 적용하면서 따라오실분은 **실제 적용하기** 섹션을 참고해주세요

## Gradle Setting

일단 [Gradle Plugin README 문서](https://github.com/OpenAPITools/openapi-generator/blob/master/modules/openapi-generator-gradle-plugin/README.adoc)를 기준으로 어떻게 설정하는지 알아보자

### 플러그인 추가

```kotlin
plugins {
  id "org.openapi.generator" version "6.6.0"
}
```

gradle 플러그인을 사용하기 위해서 위와 같이 플러그인을 추가하면 된다.

> 2023.10.26일 기준으로 [가장 최신버전](https://central.sonatype.com/artifact/org.openapitools/openapi-generator-gradle-plugin?smo=true)은 **7.0.1** 버전이다.

OpenAPI Generator에서 제공하고있는 Gradle Task는 다음과 같다.

![](/images/801096fe-2f26-4b50-b4c8-7b33b6483399-image.png)

다음과 같이 각각의 Task에 세부 설정을 구성할 수 있다.

```kotlin
openApiGenerate {
    generatorName.set("kotlin")
    inputSpec.set("$rootDir/specs/petstore-v3.0.yaml")
    outputDir.set("$buildDir/generated")
    apiPackage.set("org.openapi.example.api")
    invokerPackage.set("org.openapi.example.invoker")
    modelPackage.set("org.openapi.example.model")
    configOptions.set([
        dateLibrary: "java8"
    ])
}
```

## 생각해보기

지금까지 확인 한 내용은 다음과 같다.

- Gradle Task를 이용하여 Plugin의 Task를 등록하고 활용할 수 있다.
- 각 Task의 세부 옵션을 통해 코드가 생성되는 패키지 혹은 출력되는 디렉토리를 지정할 수 있다.

![](/images/11f1312a-9eb2-42c0-be9c-be8a0d2e5d6b-image.png)

CodeGenerator가 생성해주는 코드는 Swagger를 기반으로 하고있기 때문에 프로덕션 코드에 두기가 약간 부담스럽기도하다.

이 코드를 프로덕션에 안두고 사용할 방법은 없을까? 생각을 하다가 문득 한번 쯤 사용해봤을 법한 (아닐수도 있다) Query DSL이 생각난다. 

Query DSL은 프로덕션 코드레벨에 포함되지 않는 `QClass`라는 파일을 생성하여 동적쿼리 생성기능을 제공하고있다.

![](/images/045682a0-e624-4d57-a112-f2e3dee07f90-image.png)

빌드 시 (정확히는 컴파일 이전 단계에) 생성되는 QClass처럼 내가 원하는 파일만 추출해서 사용할 수 없을까?

### 어떤 정보를 활용할까?

OpenAPI Spec으로 작성된 문서는 서버, 클라이언트, 이해관계자 모두가 사용하는 공통의 문서다.

이 문서에서 다음과 같은 내용들을 추출한다면 가장 최상단(Application Layer)의 작업을 자동화할 수 있을 것이다.

- 서버와 클라이언트 간 통신을 위한 객체의 형태 (DTO)
- API Path, Method 선언과 요청, 응답 DTO

Gradle Task를 이용하여 API Interface, DTO를 추출하여 사용해보자.

# 실제 적용하기

> 💡 SpringBoot 3.1.4 프로젝트 (Java 17) 생성을 기준으로 설명된 글입니다. 
> 💡 Java 17을 사용하므로 **Gradle 7.4 이상**의 버전을 사용해야합니다. 
> [Gradle Java 호환 버전 확인하기](https://docs.gradle.org/current/userguide/compatibility.html)

![](/images/0ba219da-3220-4a25-9522-2ba9978c03d1-image.png)

프로젝트를 생성하고 다음과 같은 폴더 구조를 가져가보자.
기본 생성된 프로젝트에 `contract` 디렉터리와 `.yaml` 확장자의 명세가 추가된 형태다.

## Groovy 버전

### 플러그인 추가

우선 플러그인 사용을 위해 `plugins` 블록에 `org.openapi.generator` 플러그인을 추가한다.

```kotlin
plugins {
	...
    // openapi.generator 플러그인을 추가한다.
    id 'org.openapi.generator' version '7.0.1'
}
```

추가로 CodeGenerator로 작성되는 코드에 대해 다음과 같은 의존성이 필요하다.

```kotlin
dependencies {
    ...
	implementation 'org.springframework.boot:spring-boot-starter-validation'
    implementation 'org.springdoc:springdoc-openapi-starter-webmvc-ui:2.2.0'
}
```

파일 최상단에 다음과 같은 import 구문도 넣어준다.

```kotlin
import org.openapitools.generator.gradle.plugin.tasks.GenerateTask
```

### sourceSets 설정

`build/generated` 경로에 있는 소스를 프로덕션 코드가 참조할 수 있도록 sourceSets 설정을 추가한다.

> 이 설정을 해줌으로써 build/generated 내부에 있는 코드를 import하고 사용할 수 있게된다.
> 
![](/images/0b5f59cc-694a-4235-8bda-c06a36f9a611-image.png)


```kotlin
sourceSets {
    main {
        java.srcDirs("$buildDir/generated")
    }
}
```

### 변수 선언

`ext` 블록 내부에 `dir`, `openApiPackages`, `generateOpenApiTasks` 변수를 선언해준다.

```kotlin
ext {
    dirs = [
    		// 명세가 위치한 경로
            'contract'       : "$rootDir/contract",
            // 생성되는 코드들이 위치할 경로
            'openApiGenerate': "$buildDir/openapi"
    ]
	// api, invoker, model이 위치할 패키지 경로
    openApiPackages = ['openapi.api', 'openapi.invoker', 'openapi.model']

	// 명세를 기반으로 코드를 생성하는 task들을 만들고 저장해둔다.
    generateOpenApiTasks = fileTree(dirs.get("contract"))
            .files
            .findAll { file -> file.name.endsWith('.yaml') }
            .collect(file -> createOpenApiGenerateTask(file.name))
}
```

### createOpenApiGenerateTask 선언

위 변수 선언에서 작성되어있던 `createOpenApiGenerateTask()` 함수를 정의한다.

기본 속성에 대한 자세한 설명은 [README - Configuration](https://github.com/OpenAPITools/openapi-generator/blob/master/modules/openapi-generator-gradle-plugin/README.adoc#configuration)을 참고하자

```kotlin
def createOpenApiGenerateTask(String fileName) {
    tasks.register("openApiGenerate_$fileName", GenerateTask) {
        getGeneratorName().set("spring")
        getInputSpec().set("${dirs["contract"]}/$fileName")
        getOutputDir().set(dirs.get("openApiGenerate") as String)
        getApiPackage().set(openApiPackages[0] as String)
        getInvokerPackage().set(openApiPackages[1] as String)
        getModelPackage().set(openApiPackages[2] as String)
        // 다음 문서를 확인하여 적절한 옵션을 넣는다.
        // https://openapi-generator.tech/docs/generators/spring
        getConfigOptions().set(
                [
                        "dateLibrary"    : "spring",
                        "useSpringBoot3" : "true",
                        "useTags"        : "true",
                        "openApiNullable": "false",
                        // API를 interface로 생성한다.
                        "interfaceOnly"  : "true"
                ]
        )
        getTemplateDir().set("${dirs.get('contract')}/template")
    }
}
```

### Task 생성 및 의존성 추가

문서 기반으로 코드 생성 -> 필요한 Source만 사용할 곳으로 이동 -> 문서 기반으로 생성된 기반 디렉토리 삭제

```kotlin
// ext에 선언해놨던 생성된 Task들에 의존한다.
tasks.register("createOpenApi") {
    doFirst {
        println("Creating Code By OpenAPI...")
    }
    doLast {
        println("OpenAPI Code created.")
    }
    // 해당 작업은 generateOpenApiTasks에 의존한다.
    dependsOn(generateOpenApiTasks)
}


// 문서를 기반으로 생성된 코드 중 사용할 코드만 source 디렉토리로 이동한다.
tasks.register("moveGeneratedSources") {
    doFirst {
        println("Moving generated sources...")
    }

    doLast {
        openApiPackages.each { packageName ->
            def packagePath = packageName.replace(".", "/")
            def originDir = file("${dirs.get('openApiGenerate')}/src/main/java/${packagePath}")
            def destinationDir = file("$buildDir/generated/${packagePath}")
            copy {
                originDir = file("${dirs.get('openApiGenerate')}/src/main/java/${packagePath}")
                destinationDir = file("$buildDir/generated/${packagePath}")
                from originDir
                into destinationDir
            }
        }
        println 'Generated sources moved.'
    }
    // 해당 작업은 createOpenApi Task에 의존한다.
    dependsOn("createOpenApi")
}

// 문서를 기반으로 생성된 불필요한 코드들을 제거한다.
tasks.register("cleanGeneratedDirectory") {
    doFirst {
        println("Cleaning generated directory...")
    }
    doLast {
        def openApiGenerateDir = file(dirs.get('openApiGenerate'))
        if (openApiGenerateDir.exists()) {
            openApiGenerateDir.deleteDir()
            println "Directory ${openApiGenerateDir} deleted."
        } else {
            println "Directory ${openApiGenerateDir} does not exist."
        }
    }
    // 해당 작업은 moveGeneratedSources에 의존한다.
    dependsOn("moveGeneratedSources")
}

tasks.named("compileJava") {
	// 컴파일 이전에 코드 생성작업이 수행된다.
    dependsOn("cleanGeneratedDirectory")
}
```

위와 같이 의존성을 구성하면 컴파일 실행 시 Task들이 다음과 같이 실행된다.

![](/images/ec7b2b04-9fee-40c0-b5ea-e1fdb518b1d8-image.png)

## 결과

다음과 같이 build/generated 경로에 API Interface 및 명세해둔 DTO들이 생성된 것을 볼 수 있다.

![](/images/41704b5d-f919-4f3c-8699-ccd81b1d747d-image.png)

생성된 인터페이스에 다음과 같이 Swagger 명세에 대한 코드가 작성되어있다.

![](/images/1b55cc79-5ba0-40f9-9542-038c320db6fa-image.png)

이를 상속받고 구현하는 프로덕션 코드다.

![](/images/b8ff6ffe-4ec8-48bf-b4e9-afdc87ed0b6b-image.png)

구현한 코드에 대해 swagger 문서도 정상적으로 생성되는 것을 확인할 수 있다.

![](/images/a32d4bc0-c01c-4a95-b932-238f83b57d72-image.png)

# 결론

OpenAPI Spec을 기반으로 API Interface, DTO를 손쉽게 생성해봤다.

문서 하나를 잘 다룸으로써 클라이언트 - 서버간의 데이터 요청 / 응답 형태에 대한 의사소통 비용을 절약함으로써 생산성이 높아지는 것을 기대해볼 수 있을 것 같다.

![](/images/4b379f36-b9c5-4963-8637-42be568e3fc7-image.png)

실습을 해보고 싶다면 레포지토리에 `Java Spring`, `Kotlin Spring` 예제를 올려놨으니 해당 프로젝트로 실습을 진행해보면 된다.

- https://github.com/Choi-JJunho/codegen-spring-demo
- https://github.com/Choi-JJunho/codegen-kotlin-demo

> 개선요청 및 피드백은 언제나 환영입니다 🎉 🎉

# Reference

- https://openapi-generator.tech
