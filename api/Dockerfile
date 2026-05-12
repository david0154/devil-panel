FROM golang:1.22-alpine AS builder

WORKDIR /app

RUN apk add --no-cache git ca-certificates tzdata

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags='-w -s' -o devilpanel-api ./main.go

# Final lightweight image
FROM alpine:3.19

RUN apk add --no-cache ca-certificates tzdata curl

WORKDIR /app
COPY --from=builder /app/devilpanel-api .

EXPOSE 8080

CMD ["./devilpanel-api"]
