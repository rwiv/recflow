import { Test, TestingModule } from '@nestjs/testing';
import { LiveModule } from '../../live/live.module.js';
import { ChannelModule } from '../../channel/channel.module.js';
import { NodeModule } from '../../node/node.module.js';
import { CommonModule } from '../module/common.module.js';
import { Module } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

@Module({
  imports: [LiveModule, ChannelModule, CommonModule],
})
export class CustomModule {}

export function createTestApp(): Promise<TestingModule> {
  return Test.createTestingModule({
    imports: [CommonModule, LiveModule, ChannelModule, NodeModule],
  }).compile();
}

export function createCustomApp() {
  return NestFactory.create(CustomModule);
}
