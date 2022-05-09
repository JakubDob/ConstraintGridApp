cmake_minimum_required(VERSION 3.21.3) #3.21.3 is the latest on alpine

project(MinizincProton)

add_executable(
    MinizincMq
    src/main.cpp
    src/ProtonClient.cpp
    src/ProtonClient.h
)
target_compile_features(MinizincMq PRIVATE cxx_std_20)

# link with shared libs on windows and statically on other platforms
if(${CMAKE_HOST_SYSTEM_NAME} STREQUAL "Windows")
    target_compile_definitions(MinizincMq PRIVATE _WIN32_WINNT=0x0A00) #assumes win10, TODO: make it an option?
    target_compile_definitions(MinizincMq PRIVATE BOOST_FILESYSTEM_DYN_LINK)
else()
    target_compile_definitions(MinizincMq PRIVATE BOOST_FILESYSTEM_STATIC_LINK)
endif()

include(FetchContent)
FetchContent_Declare(
    json
    GIT_REPOSITORY https://github.com/nlohmann/json.git
    GIT_TAG v3.10.1
)

FetchContent_MakeAvailable(json)

find_package(Proton REQUIRED)
find_package(ProtonCpp REQUIRED)
# set(CMAKE_FIND_DEBUG_MODE TRUE)
find_package(Boost REQUIRED COMPONENTS filesystem)
# set(CMAKE_FIND_DEBUG_MODE FALSE)
message(STATUS "Boost headers: " ${Boost_INCLUDE_DIRS} ", Boost libs: " ${Boost_LIBRARIES})

message(STATUS ${BOOST_LIBRARYDIR})
target_include_directories(
    MinizincMq
    PRIVATE
    ${Boost_INCLUDE_DIRS}
)
target_link_libraries(
    MinizincMq
    PRIVATE
    Boost::filesystem
    Proton::cpp
    nlohmann_json::nlohmann_json
)
#copy dlls to the exe location
if(${CMAKE_HOST_SYSTEM_NAME} STREQUAL "Windows")
    string(REPLACE ".lib" ".dll" filesystem_dll ${Boost_LIBRARIES})
    add_custom_command(TARGET MinizincMq POST_BUILD
    COMMAND ${CMAKE_COMMAND} -E copy $<TARGET_RUNTIME_DLLS:MinizincMq> ${filesystem_dll} $<TARGET_FILE_DIR:MinizincMq>
    COMMAND_EXPAND_LISTS
    )
endif()