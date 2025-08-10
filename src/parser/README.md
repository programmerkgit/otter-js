# 構文定義 (BNF)

## プログラム構造

Program ::= Statement*
Statement ::= ExpressionStatement | BlockStatement | LetStatement | ReturnStatement
BlockStatement ::= "{" Statement* "}"

## 式

Expression ::= IfExpression | Identifier | IntegerLiteral | StringLiteral | PrefixExpression | InfixExpression |
CallExpression

## If式

IfExpression ::= "if" "(" Expression ")" BlockStatement | "if" "(" Expression ")" BlockStatement "else" BlockStatement

## 基本要素

LetStatement ::= "let" Identifier "=" Expression  
ReturnStatement::= "return" Expression
PrefixExpression ::= PrefixOperator Expression  
InfixExpression ::= Expression InfixOperator Expression  
CallExpression ::= Expression "(" (Expression ("," Expression)*)? ")"  
PrefixOperator ::= "!" | "-" | "+"    
InfixOperator ::= "+" | "-" | "*" | "/" | ">" | "<" | "==" | "!="
Identifier ::= Letter (Letter | Digit)* IntegerLiteral ::= Digit+ StringLiteral ::= '"' [^"]* '"'  
Letter ::= [a-zA-Z_]  
Digit ::= [0-9]
